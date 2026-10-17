(function initPublicReviews() {
  const form = document.getElementById("reviewForm");
  const list = document.getElementById("reviewsList");
  const listStatus = document.getElementById("reviewsListStatus");
  const formStatus = document.getElementById("reviewFormStatus");
  if (!form || !list || !listStatus || !formStatus) return;

  const config = window.TRAVELVIBE_SUPABASE || {};
  const supabaseUrl = String(config.url || "").replace(/\/$/, "");
  const anonKey = String(config.anonKey || "");

  const configured =
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl) &&
    anonKey.length > 20 &&
    !anonKey.includes("YOUR_");

  const selectFields =
    "id,display_name,place_visited,rating,review_text,created_at";
  const reviewsUrl =
    `${supabaseUrl}/rest/v1/reviews?select=${selectFields}&order=created_at.desc`;

  const headers = { apikey: anonKey };

  // Legacy anon keys are JWTs and also use the Authorization header.
  if (!anonKey.startsWith("sb_publishable_")) {
    headers.Authorization = `Bearer ${anonKey}`;
  }

  function makeText(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value;
    return element;
  }

  function renderReviews(reviews) {
    list.replaceChildren();

    if (!reviews.length) {
      list.append(
        makeText(
          "p",
          "reviews-empty",
          "No reviews yet. Be the first to share your experience."
        )
      );
      listStatus.textContent = "0 reviews";
      return;
    }

    listStatus.textContent =
      `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`;

    reviews.forEach((review) => {
      const card = document.createElement("article");
      card.className = "review-card";

      const top = document.createElement("div");
      top.className = "review-card-top";

      const ratingValue = Math.max(1, Math.min(5, Number(review.rating)));
      const rating = makeText(
        "span",
        "review-card-rating",
        `${"★".repeat(ratingValue)}${"☆".repeat(5 - ratingValue)}`
      );
      rating.setAttribute("aria-label", `${ratingValue} out of 5 stars`);

      top.append(
        rating,
        makeText("span", "review-card-place", review.place_visited)
      );

      card.append(
        top,
        makeText("p", "review-card-text", review.review_text),
        makeText("strong", "review-card-name", review.display_name),
        makeText(
          "time",
          "review-card-date",
          new Date(review.created_at).toLocaleDateString()
        )
      );

      list.append(card);
    });
  }

  async function loadReviews() {
    const response = await fetch(reviewsUrl, { headers });
    if (!response.ok) throw new Error("Could not load reviews");
    renderReviews(await response.json());
  }

  if (!configured) {
    listStatus.textContent =
      "Reviews are not connected yet. The site owner needs to add the Supabase project settings.";
    formStatus.textContent =
      "Review submission is unavailable until Supabase is configured.";
    form.querySelector("button[type='submit']").disabled = true;
    return;
  }

  loadReviews().catch(() => {
    listStatus.textContent = "Could not load reviews. Please try again later.";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";

    const data = new FormData(form);
    if (String(data.get("website") || "").trim()) return;

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    formStatus.textContent = "Publishing your review…";

    const review = {
      display_name: String(data.get("name") || "").trim(),
      place_visited: String(data.get("place") || "").trim(),
      rating: Number(data.get("rating")),
      review_text: String(data.get("review") || "").trim()
    };

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/reviews`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(review)
      });

      if (!response.ok) throw new Error("Could not publish review");

      form.reset();
      formStatus.textContent =
        "Your review is published and visible to everyone.";
      await loadReviews();
    } catch (error) {
      formStatus.textContent =
        "We couldn’t publish your review. Please check your connection and try again.";
    } finally {
      submitButton.disabled = false;
    }
  });
})();
