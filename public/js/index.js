const menuIcon = document.querySelector('.menu-icon');

menuIcon?.addEventListener('click', (e) => {
  const icon = e.target;
  const wrapperMenu = icon.closest('.user-view__menu');
  wrapperMenu.classList.toggle('show');
});
