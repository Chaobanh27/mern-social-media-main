import mongoose from 'mongoose'
import validator from 'validator'

const { Schema } = mongoose

const mediaSchema = new Schema(
  {
    // 1. QUẢN LÝ QUYỀN VÀ LIÊN KẾT
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // ID của bài Post, Story, hoặc Reel mà media này thuộc về ban đầu
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    targetType: {
      type: String,
      required: true,
      enum: ['post', 'comment', 'message', 'story']
    },

    // 2. THÔNG TIN FILE VẬT LÝ
    url: {
      type: String,
      required: true,
      validate: [validator.isURL, 'Invalid media URL']
    },
    hlsUrl: {
      type: String
    },
    type: {
      type: String,
      required: true,
      enum: ['image', 'video', 'file', 'audio'],
      index: true
    },
    mimeType: String,
    size: Number, // Bytes

    // 3. THÔNG SỐ KỸ THUẬT (Dành cho Pinterest & Reels Feed)
    metadata: {
      width: Number,
      height: Number,
      aspectRatio: { type: Number, index: true }, // Cực kỳ quan trọng cho Pinterest Masonry Layout
      duration: Number, // Giây (Dành cho video/audio - Reels)
      thumbnailUrl: String, // Ảnh preview cho video
      //blurHash: String, // Chuỗi mã hóa ảnh mờ để load mượt mà kiểu Pinterest
      dominantColor: {
        type: String,
        default: '#eeeeee'
      }, // Màu chủ đạo của ảnh
      technical: {
        code: {
          type: String
        },
        bitRate: {
          type: Number
        }
      }
    },

    // 4. LƯU TRỮ (Storage Cloud)
    storage: {
      provider: {
        type: String,
        required: true,
        enum: ['cloudinary', 's3', 'local']
      },
      publicId: String, // Cloudinary Public ID hoặc S3 Key để xóa/sửa sau này
      bucket: String
    },

    // 5. THỐNG KÊ HIỆU SUẤT (Dùng để tính toán video/ảnh "Hot")
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      hotScore: { type: Number, default: 0, index: -1 } // Điểm ưu tiên để lên xu hướng
    },

    // 6. TRẠNG THÁI VÀ THỨ TỰ
    order: { type: Number, default: 0 }, // Thứ tự ảnh trong một bài Post có nhiều ảnh
    isActive: { type: Boolean, default: true, index: true },
    privacy: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public'
    }
  },
  {
    collection: 'media',
    timestamps: true
  }
)

// --- CÁC CHỈ MỤC TỐI ƯU (INDEXES) ---

// Hỗ trợ lấy Feed Pinterest/Reels theo thời gian và độ hot
mediaSchema.index({ type: 1, isActive: 1, 'stats.hotScore': -1, createdAt: -1 })

// Hỗ trợ tìm kiếm media của một user cụ thể
mediaSchema.index({ user: 1, type: 1, createdAt: -1 })

const mediaModel = mongoose.model('Media', mediaSchema)

export default mediaModel