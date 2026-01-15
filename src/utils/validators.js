const isEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0;
};

module.exports = {
  isEmail,
  isNonEmptyString,
  isPositiveInteger
};
