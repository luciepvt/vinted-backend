const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Offer = require("../models/Offer");
const isAuthenticated = require("../middleWares/isAuthenticated");

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
    const { title, description, price, condition, city, brand, size, color } =
      req.fields;

    // isAuthenticated OK
    const offer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { CONDITION: condition },
        { BRAND: brand },
        { SIZE: size },
        { COLOR: color },
        { CITY: city },
      ],

      product_image: await cloudinary.uploader.upload(req.files.picture.path, {
        folder: "vinted/offers",
        public_id: `${title} - ${offer._id}`,
      }).secure_url,

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
    const {
      id,
      title,
      description,
      price,
      condition,
      brand,
      size,
      color,
      city,
    } = req.fields;

    const offerToUpdate = await Offer.findByIdAndUpdate(
      id,
      {
        product_name: title,
        product_description: description,
        product_price: price,
        $set: {
          "product_details.0.CONDITION": condition,
          "product_details.1.BRAND": brand,
          "product_details.2.SIZE": size,
          "product_details.3.COLOR": color,
          "product_details.4.CITY": city,
        },
        product_image: await cloudinary.uploader.upload(
          req.files.picture.path,
          {
            folder: "vinted/offers",
            public_id: `${title} - ${offerToUpdate._id}`,
          }
        ).secure_url,
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
    const { title, priceMin, priceMax, sort } = req.query;

    let filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      filters.product_price = { $gte: priceMin };
    }

    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = priceMax;
      } else {
        filters.product_price = { $lte: priceMax };
      }
    }

    const sortObject = {};
    if (sort === "price-desc") {
      sortObject.product_price = "desc";
    } else if (sort === "price-asc") {
      sortObject.product_price = "asc";
    }

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
