const bcryptjs = require('bcryptjs');

const password = 'Children$6';

bcryptjs.hash(password, 10).then(hash => {
  console.log('Password hash for "' + password + '":');
  console.log(hash);
}).catch(err => {
  console.error('Error:', err);
});
