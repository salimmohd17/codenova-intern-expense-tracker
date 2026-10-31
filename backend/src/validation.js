const MAX_AMOUNT = 1_000_000_000;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function validateTransaction(input) {
  const errors = {};
  input = input && typeof input === 'object' && !Array.isArray(input) ? input : {};

  const type = typeof input.type === 'string' ? input.type.trim() : '';
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const category = typeof input.category === 'string' ? input.category.trim() : '';
  const date = typeof input.date === 'string' ? input.date.trim() : '';
  const notes = typeof input.notes === 'string' ? input.notes.trim() : '';
  const rawAmount = input.amount;
  const amountIsValidType = typeof rawAmount === 'number'
    || (typeof rawAmount === 'string' && rawAmount.trim() !== '');
  const amount = amountIsValidType ? Number(rawAmount) : Number.NaN;

  if (!['income', 'expense'].includes(type)) errors.type = 'Type must be income or expense.';
  if (!title) errors.title = 'Description is required.';
  else if (title.length > 100) errors.title = 'Description must be 100 characters or fewer.';
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    errors.amount = `Amount must be greater than 0 and no more than ${MAX_AMOUNT}.`;
  }
  if (!category) errors.category = 'Category is required.';
  else if (category.length > 40) errors.category = 'Category must be 40 characters or fewer.';
  if (!isoDatePattern.test(date)) {
    errors.date = 'Date must use YYYY-MM-DD format.';
  } else {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
      errors.date = 'Date is not a valid calendar date.';
    } else {
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      if (date > tomorrow.toISOString().slice(0, 10)) errors.date = 'Date cannot be more than one day in the future.';
    }
  }
  if (notes.length > 500) errors.notes = 'Notes must be 500 characters or fewer.';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: { type, title, amount, category, date, notes }
  };
}
