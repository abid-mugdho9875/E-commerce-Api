const Review = require('../models/Review');
const Product = require('../models/Product');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
// const { checkPermissions } = require('../utils');
const checkPermissions = (requestUser, resourceUserId) => {
    // console.log(requestUser);
    // console.log(resourceUserId);
    // console.log(typeof resourceUserId);
    if (requestUser.role === 'admin') return;
    if (requestUser.userId === resourceUserId.toString()) return;
    throw new CustomError.UnauthorizedError(
      'Not authorized to access this route'
    );
  };

const createReview = async (req, res) => {
    const { product: productId } = req.body;
    const isValidProduct = await Product.findOne({ _id: productId });
    if (!isValidProduct) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
      }
      const alreadySubmitted = await Review.findOne({
        product: productId,
        user: req.user.userId,
      });
      if (alreadySubmitted) {
        throw new CustomError.BadRequestError(
          'Already submitted review for this product'
        );
      }
      console.log(req.body.user)
      req.body.user = req.user.userId;
      console.log(req.body.user)
      const review = await Review.create(req.body);
     res.status(StatusCodes.CREATED).json({ review });

};
const getAllReviews = async (req, res) => {
    const reviews = await Review.find({})
    .populate({
        path: 'product',
        select: 'name company price',
      })
    .populate({
        path: 'user',
        select:'name'
    })
    
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId })
    .populate({
        path: 'product',
        select: 'name company price',
      })
    .populate({
        path: 'user',
        select:'name'
    });
  
    if (!review) {
      throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
    }
  
    res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  checkPermissions(req.user, review.user);
  await review.deleteOne();
  

  res.status(StatusCodes.OK).json({ msg: 'Success! Review removed' });
};
const getSingleProductReviews = async (req, res) => {
    const { id: productId } = req.params;
    const reviews = await Review.find({ product: productId });
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
  };

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};