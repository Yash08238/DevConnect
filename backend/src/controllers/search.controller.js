const searchService = require("../services/search.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

exports.globalSearch = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(200).json(new ApiResponse(200, { users: [], posts: [], communities: [], jobs: [] }));
  }

  const results = await searchService.searchAll(q, 10);

  res.status(200).json(new ApiResponse(200, results));
});
