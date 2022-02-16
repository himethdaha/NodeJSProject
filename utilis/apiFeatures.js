class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  //BASIC FILTERING
  filter() {
    //Create the filterObject
    const filterObj = { ...this.queryString };
    //How the filterObj look = {duration: '5', difficulty: 'easy'}

    //Create an array with the query parameters that should be excluded when filtering
    const fieldsToExclude = ['page', 'sort', 'fields', 'limit'];

    //Remove the fieldsToExclude from the filerObj
    fieldsToExclude.forEach((el) => delete filterObj[el]);

    //FILTERING FOR RELATIONAL OPERATORS IN THE QUERY
    //Get the filtered object and convert it to a string
    let queryStr = JSON.stringify(filterObj);
    //Replace the relational operators to be used by mongodb
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //The query which contains the filtered document with other options
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  //SORTING
  sort() {
    if (this.queryString.sort) {
      //Split the sorting options and join them by a space for mongoose to use
      const querySort = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(querySort);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  //LIMITING FIELDS
  limitFields() {
    if (this.queryString.fields) {
      //Split the fields and join them by a space for mongoose to use
      const queryFields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(queryFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  //PAGINATION
  paginate() {
    //Get the page
    const page = Number(this.queryString.page) || 1;
    //Get the limit
    const limit = Number(this.queryString.limit) || 5;
    //Number of results to skip
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
