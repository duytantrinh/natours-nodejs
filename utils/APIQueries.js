class APIQueries {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 127.0.0.1:3000/api/v1/tours?sort=-price,-ratingsAverage
    if (this.queryString.sort) {
      const sortedBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortedBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  //(=== 3. Limited Fields = choose which fields we want to get back on query)
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  //(=== 4. Pagination)
  paginate() {
    const page = this.queryString.page * 1 || 1; // connvert sang Number || default value
    const limit = this.queryString.limit * 1 || 24;

    const skip = limit * (page - 1);
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIQueries;
