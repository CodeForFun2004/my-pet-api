const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const Post = require("../models/post.model");

const uploadPostImage = upload({
    folderPrefix: "my-pet/forum/posts",
    nameField: "author",
    model: Post,
});

// 📄 Post CRUD
router.get("/posts", postController.getAllPosts);
router.get("/posts/:postId", postController.getPostById);
// 📄 Post CRUD
router.post(
  "/posts",
  protect,
  uploadPostImage.array("images", 10), // <--- CHỈNH Ở ĐÂY
  postController.createPost
);

router.put("/posts/:postId", protect, uploadPostImage.array("images", 10), postController.updatePost);
router.delete("/posts/:postId", protect, postController.deletePost);

// ❤️ Like / Favorite
router.post("/posts/:postId/like", protect, postController.toggleLike);
router.post("/posts/:postId/favorite", protect, postController.toggleFavorite);

// 💬 Comments
router.post("/posts/:postId/comments", protect, postController.addComment);
router.put("/posts/:postId/comments/:commentId", protect, postController.editComment);
router.delete("/posts/:postId/comments/:commentId", protect, postController.deleteComment);
router.post("/posts/:postId/comments/:commentId/like", protect, postController.toggleCommentLike);

module.exports = router;
