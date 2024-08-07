import { Post } from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

export const createPost = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Your are not allowed to create a post"));
  }

  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide all the required fields."));
  }

  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json({
      success: true,
      post: savedPost,
    });
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};


export const deletePost =async(req,res,next)=>{
  try {
    if(!req.user.isAdmin || req.user.id!=req.params.userId)
    {
      next(errorHandler(403,"You are not allowed to delete the post"));
    }

    const deletedPost=await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({message:"Post has been deleted",success:true});

  } catch (error) {
    next(error);
  }
}

export const updatePost=async(req,res,next)=>{
  if(!req.user.isAdmin || req.user.id!=req.params.userId)
  {
    next(errorHandler(403,"You are not allowed to edit the post"));
  }
   try {
    const updatedPost=await Post.findByIdAndUpdate(req.params.postId,{
      $set:{
        title:req.body.title,
        category:req.body.category,
        image:req.body.image,
        content:req.body.content
      }},{new:true});
    
      res.status(201).json({
        message:"Post has been updated successfully",
        success: true,
        post: updatedPost,
      });
   } catch (error) {
    next(error);
   }
}