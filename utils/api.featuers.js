// the list of the exculded parameters ;
const excludedParameters = [
  'limit',
  'size',
  'page',
  'sort',
  'fields',
  'keyword'
];
const removeAttr = '-createdAt -updatedAt -__v';

class ApiFeatuers {
  constructor(mongooseQuery, reqQueryObject) {
    this.mongooseQuery = mongooseQuery;
    this.reqQueryObject = reqQueryObject;
  }

  filter = () => {
    // Making a deep copy of the this.reqQueryObject object ;
    const queryObject = {...this.reqQueryObject};
    console.log('this is the query object : ', queryObject);
    // exculded the un-needed parameters from going to the query ;
    excludedParameters.forEach((element) => delete queryObject[element]);

    // stringfiying the queryObject ;
    let query = JSON.stringify(queryObject);
    console.log('this is the query : ', query);

    // Searching for ( greater than ) || (greater than or equal ) || (less than ) || (less than or equal ) ;
    // to put a dollar sign before them
    // to execute the query ;
    query = query.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // Parsing the Query String to pass to the mongoose engine ;
    query = JSON.parse(query);
    console.log('this is the query uuuuuuuu: ', query);
    this.mongooseQuery = this.mongooseQuery.find(query);
    return this;
  };

  sort = () => {
    // Sorting
    if (this.reqQueryObject.sort) {
      const sortBy = this.reqQueryObject.sort
        .split(',')
        .map((field) => field.trim()) // Trim whitespace
        .filter((field) => field) // Remove empty strings
        .join(' '); // Join into a single string

      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      // Default sorting (if needed)
      this.mongooseQuery = this.mongooseQuery.sort('createdAt');
    }
    return this;
  };

  search = () => {
    // search :
    if (this.reqQueryObject.keyword) {
      console.log(
        'this is the this.reqQueryObject.keyword ',
        this.reqQueryObject.keyword
      );
      const query = {};
      query.$or = [
        {
          name: {$regex: this.reqQueryObject.keyword, $options: 'i'}
        },
        {
          description: {$regex: this.reqQueryObject.keyword, $options: 'i'}
        }
      ];
      console.log('this is the query : ', query);
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  };

  limitFields = () => {
    // Fields Linting
    if (this.reqQueryObject.fields) {
      // If fields are specified:
      const fields = this.reqQueryObject.fields.split(',').join(' '); // Join into a single string

      console.log('Selected fields:', fields);
      this.mongooseQuery = this.mongooseQuery.select(fields); // Correct usage
    } else {
      // If no fields are specified, exclude unwanted fields
      this.mongooseQuery = this.mongooseQuery.select(removeAttr);
    }
    return this;
  };

  paginate = (totalCount) => {
    console.log('this is the query string : ', this.reqQueryObject);
    const size = Number.parseInt(this.reqQueryObject.limit) || 5;
    const page = Number.parseInt(this.reqQueryObject.page) || 1;
    const limit = Number.parseInt(size);
    const skip = (Number.parseInt(page) - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit)
      ? Math.ceil(totalCount / limit)
      : 1;
    const pagination = {
      limit,
      skip,
      page,
      totalCount,
      totalPages
    };
    this.mongooseQuery.skip(pagination.skip).limit(pagination.limit);
    this.paginationResult = pagination;
    return this;
  };

  populate = (object) => {
    this.mongooseQuery = this.mongooseQuery.populate(object);
    return this;
  };

  aggregate = (object) => {
    this.mongooseQuery = this.mongooseQuery.aggregate(object);
    return this;
  };
}

export default ApiFeatuers;
