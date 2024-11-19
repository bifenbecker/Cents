require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const formatError = require('../../../utils/formatError');

describe('test the utility: formatError', () => {
  it('should return the full error string if that is unspecified', async () => {
    const error = new Error('test error');
    const result = formatError(error);

    expect(result).to.equal(error.message);
  });

  it('should return the full error string if that contains characters in one instance of "[" or "]"', async () => {
    const error_a = new Error('test [ error');
    const error_b = new Error('test ] error');
    const result_a = formatError(error_a);
    const result_b = formatError(error_b);

    expect(result_a).to.equal(error_a.message);
    expect(result_b).to.equal(error_b.message);
  });

  it('should return the full error string if that contains characters in one instance of special symbols !@#$%^&*(){}[]"', async () => {
    const error = new Error('test !@#$%^&*(){}[]"');
    const result = formatError(error);

    expect(result).to.equal(error.message);
  });

  it('should return only clarification if that has it', async () => {
    const error = new Error('test error [with clarification]');
    const result = formatError(error);

    expect(result).to.equal('with clarification');
  });

  it('should return only first clarification if that has it more than one', async () => {
    const error = new Error('test error [first clarification] [and another clarification] [and last clarification]');
    const result = formatError(error);

    expect(result).to.equal('first clarification');
  });
});
