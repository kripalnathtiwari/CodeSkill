const bcrypt = require('bcryptjs');
const hash = "$2a$10$4S.MouAE7fYLLhK8q7BzmuMkoQTgZMUylC3InPtlxnggmxaK3hjRi";
bcrypt.compare("Pass123@", hash).then(console.log);
