const User = require("../models/User");
const Post = require("../models/Post");
const Community = require("../models/Community");
const Job = require("../models/Job");

exports.searchAll = async (query, limit = 5) => {
  const searchRegex = new RegExp(query, "i");

  const [users, posts, communities, jobs] = await Promise.all([
    User.find({ $or: [{ name: searchRegex }, { username: searchRegex }, { bio: searchRegex }] })
      .select("name username avatar bio followerCount")
      .limit(limit),
    Post.find({ $or: [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }] })
      .select("title content tags likeCount commentCount type")
      .populate("author", "name username avatar")
      .limit(limit),
    Community.find({ $or: [{ name: searchRegex }, { description: searchRegex }, { tags: searchRegex }] })
      .select("name slug avatar description memberCount")
      .limit(limit),
    Job.find({ $or: [{ title: searchRegex }, { "company.name": searchRegex }, { tags: searchRegex }] })
      .select("title company location type salary")
      .limit(limit),
  ]);

  return { users, posts, communities, jobs };
};
