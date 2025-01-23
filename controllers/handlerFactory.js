const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIQueries = require('../utils/APIQueries');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndDelete(req.params.id);

    if (!data) {
      return next(new AppError('No data found with that id', 404));
    }

    //status 204 : NO CONTENT
    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // set validator theo tourSchema
    });

    if (!data) {
      return next(new AppError('No data found with that id', 404));
    }

    res.status(200).json({
      status: 'Success',
      data: {
        data,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //   console.log(req.body); // data come with POST request body

    const newData = await Model.create(req.body);

    // send result to client
    res.status(201).json({
      status: 'success',
      data: {
        data: newData,
      },
    });
  });

exports.getOne = (Model, popOptions, currentId) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) {
      query = query.populate(popOptions);
      //Tour.findOne({_id:req.params.id});
    }

    const data = await query;

    // console.log(data);

    if (!data) {
      return next(new AppError('No data found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // [1.  Execute tất cả các Query đc tạo bên APIQueries]
    const features = new APIQueries(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const datas = await features.query;

    // [2. SEND response]
    res.status(200).json({
      status: 'success',
      results: datas.length, // optional
      data: {
        datas,
      },
    });
  });
