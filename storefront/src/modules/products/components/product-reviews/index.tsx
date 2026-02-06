"use client"

import { useState } from "react"
import { Star, MessageSquare, User } from "lucide-react"
import { useProductReviews } from "@lib/hooks/use-product-reviews"

type Props = {
  productId: string
}

function StarRating({
  rating,
  size = 16,
  interactive = false,
  onRate,
}: {
  rating: number
  size?: number
  interactive?: boolean
  onRate?: (r: number) => void
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive ? star <= (hover || rating) : star <= Math.round(rating)
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            className={`${interactive ? "cursor-pointer" : "cursor-default"} transition`}
          >
            <Star
              size={size}
              className={filled ? "fill-yellow-400 text-yellow-400" : "text-grey-30"}
            />
          </button>
        )
      })}
    </div>
  )
}

export default function ProductReviews({ productId }: Props) {
  const { reviews, averageRating, ratingCounts, addReview, total } =
    useProductReviews(productId)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    author: "",
    rating: 0,
    title: "",
    body: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.author.trim() || !formData.rating || !formData.body.trim()) return
    addReview({
      author: formData.author.trim(),
      rating: formData.rating,
      title: formData.title.trim(),
      body: formData.body.trim(),
    })
    setFormData({ author: "", rating: 0, title: "", body: "" })
    setSubmitted(true)
    setShowForm(false)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-semibold text-grey-90 flex items-center gap-2">
            <MessageSquare size={18} />
            Customer Reviews
          </h3>
          {total > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <StarRating rating={averageRating} size={18} />
              <span className="text-[14px] font-semibold text-grey-90">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-[13px] text-grey-50">
                ({total} review{total !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="h-9 px-4 rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition"
        >
          Write a Review
        </button>
      </div>

      {submitted && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-[13px] text-green-700">
          Thank you! Your review has been submitted.
        </div>
      )}

      {/* Rating breakdown */}
      {total > 0 && (
        <div className="rounded-xl border border-grey-20 bg-white p-4 space-y-2">
          {ratingCounts.map(({ star, count }) => {
            const pct = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-3 text-[12px]">
                <span className="w-8 text-right text-grey-50 font-medium">
                  {star} <Star size={10} className="inline fill-yellow-400 text-yellow-400" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-grey-10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-grey-40">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-grey-20 bg-white p-5 space-y-4"
        >
          <h4 className="text-[14px] font-semibold text-grey-90">Write Your Review</h4>

          <div>
            <label className="block text-[12px] font-medium text-grey-50 mb-1.5">
              Your Rating *
            </label>
            <StarRating
              rating={formData.rating}
              size={24}
              interactive
              onRate={(r) => setFormData((d) => ({ ...d, rating: r }))}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-grey-50 mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData((d) => ({ ...d, author: e.target.value }))}
              placeholder="Your name"
              required
              className="w-full h-9 rounded-lg border border-grey-20 px-3 text-[13px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-grey-50 mb-1.5">
              Review Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
              placeholder="Summarize your experience"
              className="w-full h-9 rounded-lg border border-grey-20 px-3 text-[13px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-grey-50 mb-1.5">
              Review *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData((d) => ({ ...d, body: e.target.value }))}
              placeholder="Tell us what you think about this product..."
              required
              rows={4}
              className="w-full rounded-lg border border-grey-20 px-3 py-2 text-[13px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:border-brand resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!formData.author.trim() || !formData.rating || !formData.body.trim()}
              className="h-10 px-6 rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-10 px-6 rounded-lg border border-grey-20 text-grey-60 text-[13px] font-medium hover:border-grey-40 hover:text-grey-90 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 && !showForm ? (
        <div className="rounded-xl border border-grey-20 bg-white p-6 text-center">
          <p className="text-[14px] text-grey-50">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-grey-20 bg-white p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center">
                    <User size={14} className="text-brand" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-grey-90">
                      {review.author}
                    </p>
                    <p className="text-[11px] text-grey-40">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} size={14} />
              </div>
              {review.title && (
                <p className="text-[14px] font-semibold text-grey-90">{review.title}</p>
              )}
              <p className="text-[13px] text-grey-60 leading-relaxed">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
