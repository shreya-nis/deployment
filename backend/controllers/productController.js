const Product = require('../models/Product');
const Order = require('../models/Order');
const { logActivity } = require('../utils/logger');

// @desc    Get all active products for storefront
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category, isFeatured, search, sort } = req.query;
    const query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let queryBuilder = Product.find(query);

    if (sort === 'price-low') {
      queryBuilder = queryBuilder.sort({ price: 1 });
    } else if (sort === 'price-high') {
      queryBuilder = queryBuilder.sort({ price: -1 });
    } else if (sort === 'name') {
      queryBuilder = queryBuilder.sort({ name: 1 });
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const products = await queryBuilder;

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products for admin (including inactive)
// @route   GET /api/products/admin/all
// @access  Admin
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // If viewer is not admin, only show active product
    if (!product.isActive && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Product is currently unavailable',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Admin
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, isFeatured, isActive } = req.body;

    let image = req.body.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!name || !description || price === undefined || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, category, and image',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      image,
      stock: stock !== undefined ? Number(stock) : 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isActive: isActive === undefined ? true : isActive === 'true' || isActive === true,
    });

    await logActivity({
      user: req.user,
      action: 'PRODUCT_CREATED',
      description: `Product created: "${product.name}" ($${product.price})`,
      relatedId: product._id,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
    }
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    await logActivity({
      user: req.user,
      action: 'PRODUCT_UPDATED',
      description: `Product updated: "${product.name}"`,
      relatedId: product._id,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or deactivate product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product is part of any orders
    const hasOrders = await Order.findOne({ 'items.product': product._id });

    if (hasOrders) {
      // Soft-delete to preserve order history integrity
      product.isActive = false;
      await product.save();

      await logActivity({
        user: req.user,
        action: 'PRODUCT_DEACTIVATED',
        description: `Product deactivated (preserved for order history): "${product.name}"`,
        relatedId: product._id,
      });

      return res.status(200).json({
        success: true,
        message: 'Product has historical orders and was safely deactivated instead of deleted.',
        product,
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user,
      action: 'PRODUCT_DELETED',
      description: `Product permanently deleted: "${product.name}"`,
      relatedId: product._id,
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted permanently',
    });
  } catch (error) {
    next(error);
  }
};
