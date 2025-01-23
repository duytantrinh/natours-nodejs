/* eslint-disable */

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    console.log(res);

    // nếu log in thành công sẽ tự refresh về trang homepage sau 1.5s
    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/'); // reload về trang /
      }, 500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

document.querySelector('#form--login')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    // console.log(res.data.status);

    // nếu log out thành công sẽ tự refresh về trang homepage sau 1.5s
    if (res.data.status === 'success') {
      location.reload(true); // (phải có true để clear cache)
    }
  } catch (err) {
    alert('Error logging out! try again');
  }
};

document.querySelector('a#logout')?.addEventListener('click', logout);

// type: = password OR data
const updateSettings = async (data, type) => {
  try {
    const link = type === 'password' ? 'updateMyPassword' : 'updateMe';

    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${link}`,
      data,
    });

    if (res.data.status === 'success') {
      alert('Updated !!!');
    }
  } catch (err) {
    alert('wrong');
  }
};

document.querySelector('.form-user-data')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const form = new FormData();
  form.append('name', document.getElementById('name').value);
  form.append('email', document.getElementById('email_usersettings').value);
  form.append('photo', document.getElementById('photo').files[0]); // for file photo upload

  // console.log(form);

  updateSettings(form, 'data');
});

// Update Password form
document
  .querySelector('.form-user-settings')
  ?.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById('btn-save__password').textContent =
      'Updating......';
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm =
      document.getElementById('password-confirm').value;

    await updateSettings(
      { oldPassword, newPassword, newPasswordConfirm },
      'password'
    );

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';

    document.getElementById('password-confirm').value = '';
    document.getElementById('btn-save__password').textContent =
      'Save Password.';
  });
