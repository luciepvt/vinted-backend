// Import d'express pour pouvoir faire express.Router
const express = require("express");
const router = express.Router();
// import de cloudinary
const cloudinary = require("cloudinary").v2;

// import du modele Offer
const Offer = require("../models/Offer");

// import du middleWare
const isAuthenticated = require("../middleWares/isAuthenticated");

// paramétrage de cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// ************************************************************************************************************************************************************************************************************//
//                                                                                              Publish an offer
// ************************************************************************************************************************************************************************************************************//

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // envoi de l'image sur cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path);
    // isAuthenticated OK!!!!!
    const offer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { CONDITION: req.fields.condition },
        { BRAND: req.fields.brand },
        { SIZE: req.fields.size },
        { COLOR: req.fields.color },
        { CITY: req.fields.city },
      ],
      product_image: result.secure_url,
      owner: req.user._id,
    });
    await offer.save();
    res.json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ************************************************************************************************************************************************************************************************************//
//                                                                                              Update an offer
// ************************************************************************************************************************************************************************************************************//

router.put("/update/offer", async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.files.picture.path);
    const offerToUpdate = await Offer.findByIdAndUpdate(
      req.fields.id,
      {
        product_name: req.fields.title,
        product_description: req.fields.description,
        product_price: req.fields.price,
        $set: {
          "product_details.0.CONDITION": req.fields.condition,
          "product_details.1.BRAND": req.fields.brand,
          "product_details.2.SIZE": req.fields.size,
          "product_details.3.COLOR": req.fields.color,
          "product_details.4.CITY": req.fields.city,
        },
        product_image: result.secure_url,
      },
      { new: true }
    );
    if (offerToUpdate) {
      res.status(200).json(offerToUpdate);
    } else {
      res.status(404).json({ message: "offer not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ************************************************************************************************************************************************************************************************************//
//                                                                                               filters offers
// ************************************************************************************************************************************************************************************************************//

router.get("/offers", async (req, res) => {
  try {
    // faire un objet vide et à chaque query condition
    let filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    }
    // on vérifie si on a deja une clé product_price dans filters

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = { $lte: req.query.priceMax };
      }
    }

    //gestion du tri avec .sort()

    const sortObject = {};
    if (req.query.sort === "price-desc") {
      sortObject.product_price = "desc";
    } else if (req.query.sort === "price-asc") {
      sortObject.product_price = "asc";
    }

    // gestion de la pagination
    // page 1 skip(number) tant que number < limit, page 2 : number = limit et < limitx2, page 3 : number = limitx2 et <limit x3

    let limit = 3;
    if (req.query.limit) {
      limit = req.query.limit;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const skipPage = (page - 1) * limit;

    const offers = await Offer.find(filters)
      .sort(sortObject)
      .skip(skipPage)
      .limit(limit)
      .select("product_name product_price");

    const count = await Offer.countDocuments(filters);

    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ************************************************************************************************************************************************************************************************************//
//                                                                                                offer id
// ************************************************************************************************************************************************************************************************************//

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email -_id",
    });
    res.json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
