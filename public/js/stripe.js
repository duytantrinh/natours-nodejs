// import { showAlert } from './alerts';

const bookTour = async (tourId) => {
  // Publishable API key
  const stripe = Stripe(
    'pk_test_51QjzjWG6sf4AamqYmSWn3UMvM4JjK97QQbsQMoAvvpGCX0RTBQMTNy7hBDTCvfzWVgKd6TnyphqTabi0B972dLcS00rJYKLRXS'
  );

  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + redirect to checkout Stripe page
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
  }
};

const bookBtn = document.querySelector('#book-tour');

bookBtn?.addEventListener('click', (e) => {
  e.target.textContent = 'Processing...';
  const { tourId } = e.target.dataset;

  bookTour(tourId);
});
