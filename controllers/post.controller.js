const Post = require("../models/post.model");

// 🔹 Helper format function
function formatPost(post, currentUserId) {
  return {
    id: post._id,
    author: post.author,
    content: post.content,
    images: post.images,
    tags: post.tags,
    address: post.address,
    likeCount: post.likes.length,
    favoriteCount: post.favorites.length,
    commentCount: post.comments.length,
    isLiked: currentUserId ? post.likes.includes(currentUserId) : false,
    isFavorited: currentUserId ? post.favorites.includes(currentUserId) : false,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

// 🔹 GET /api/forum/posts
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const posts = await Post.find()
      .populate("author", "username avatar")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments();
    const currentUserId = req.user ? req.user.id : null;
    const data = posts.map((p) => formatPost(p, currentUserId));

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 GET /api/forum/posts/:postId
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");

    if (!post) return res.status(404).json({ error: "Post not found" });

    const formatted = formatPost(post, req.user ? req.user.id : null);
    formatted.comments = post.comments.map((c) => ({
      id: c._id,
      author: c.author,
      content: c.content,
      parentId: c.parentId,
      isLiked: req.user ? c.likes.includes(req.user.id) : false,
      likeCount: c.likes.length,
      createdAt: c.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 POST /api/forum/posts
exports.createPost = async (req, res) => {
  try {
    const { content, tags , address} = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length < 1)
      return res.status(400).json({ error: "Content required" });

    // Nếu upload nhiều ảnh
    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    const addressTrimmed = req.body.address ? req.body.address.trim() : "";

    const newPost = new Post({
      author: userId,
      content,
      images: imageUrls, // mảng URL từ Cloudinary
      tags,
      address: addressTrimmed,
    });

    await newPost.save();

    const populated = await newPost.populate("author", "username avatar");
    res.status(201).json(formatPost(populated, userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// 🔹 PUT /api/forum/posts/:postId
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, tags, address, keepImages } = req.body; // 👈 Thêm keepImages
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });

    // Xử lý upload ảnh mới (nếu có) - multer đã upload lên Cloudinary
    const newImageUrls = req.files ? req.files.map(file => file.path) : [];
    
    // ✅ Parse keepImages từ JSON string
    let keepImageUrls = [];
    if (keepImages) {
      try {
        keepImageUrls = JSON.parse(keepImages);
        console.log('UPDATE POST: keepImages parsed:', keepImageUrls.length, 'images');
      } catch (e) {
        console.error('Error parsing keepImages:', e);
      }
    }

    // ✅ GỘP ảnh cũ (muốn giữ) + ảnh mới (vừa upload)
    if (newImageUrls.length > 0 || keepImageUrls.length > 0) {
      post.images = [...keepImageUrls, ...newImageUrls];
      console.log('UPDATE POST: Merged images:', {
        kept: keepImageUrls.length,
        new: newImageUrls.length,
        total: post.images.length
      });
    }
    // Nếu không có cả 2 → có thể giữ nguyên hoặc clear
    // Option 1: Giữ nguyên (default behavior)
    // Option 2: Clear images nếu user xóa hết: post.images = []

    // Update các field khác
    post.content = content ?? post.content;
    
    // ✅ Parse tags nếu là JSON string
    if (tags) {
      try {
        post.tags = JSON.parse(tags);
      } catch (e) {
        post.tags = tags; // Fallback nếu không phải JSON
      }
    }
    
    post.address = address ?? post.address;

    await post.save();

    const updated = await post.populate("author", "username avatar");
    res.json(formatPost(updated, req.user.id));
  } catch (err) {
    console.error("UPDATE POST ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// 🔹 DELETE /api/forum/posts/:postId
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.author.toString() !== req.user.id && !req.user.isAdmin)
      return res.status(403).json({ error: "Forbidden" });

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 POST /api/forum/posts/:postId/like
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const index = post.likes.indexOf(userId);
    if (index === -1) post.likes.push(userId);
    else post.likes.splice(index, 1);

    await post.save();

    res.json({
      likeCount: post.likes.length,
      isLiked: index === -1,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 POST /api/forum/posts/:postId/favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const index = post.favorites.indexOf(userId);
    if (index === -1) post.favorites.push(userId);
    else post.favorites.splice(index, 1);

    await post.save();

    res.json({
      favoriteCount: post.favorites.length,
      isFavorited: index === -1,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 POST /api/forum/posts/:postId/comments
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length < 1)
      return res.status(400).json({ error: "Content required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const newComment = {
      author: userId,
      content,
      parentId: parentId || null,
    };

    post.comments.push(newComment);
    await post.save();

    const populated = await post.populate("comments.author", "username avatar");
    const createdComment = populated.comments[populated.comments.length - 1];

    res.status(201).json({
      id: createdComment._id,
      author: createdComment.author,
      content: createdComment.content,
      likeCount: 0,
      createdAt: createdComment.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 PUT /api/forum/posts/:postId/comments/:commentId
exports.editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });

    comment.content = content;
    await post.save();

    res.json({ message: "Comment updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 DELETE /api/forum/posts/:postId/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.author.toString() !== req.user.id && !req.user.isAdmin)
      return res.status(403).json({ error: "Forbidden" });

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 POST /api/forum/posts/:postId/comments/:commentId/like
exports.toggleCommentLike = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const index = comment.likes.indexOf(userId);
    if (index === -1) comment.likes.push(userId);
    else comment.likes.splice(index, 1);

    await post.save();

    res.json({
      likeCount: comment.likes.length,
      isLiked: index === -1,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
