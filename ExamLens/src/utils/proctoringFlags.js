/**
 * Standardized Proctoring Flag Constants & Helper Utilities for ExamLens.
 */

export const FLAG_TYPES = {
  MISSING_FACE: 'missing_face',
  MULTIPLE_FACES: 'multiple_faces',
  PHONE_DETECTED: 'phone_detected',
  TAB_SWITCH: 'tab_switch',
  FULLSCREEN_EXIT: 'fullscreen_exit',
};

/**
 * Creates a standardized proctoring flag event object with an ISO timestamp.
 * 
 * @param {Object} params
 * @param {string} params.type - Must be one of FLAG_TYPES
 * @param {number} params.confidence - Number between 0.0 and 1.0
 * @param {string} params.rule - Non-empty string explaining the trigger rule
 * @returns {Object} Standardized proctoring flag object
 */
export function createProctoringFlag({ type, confidence = 1.0, rule = '' }) {
  return {
    type,
    confidence,
    rule,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validates whether a flag object conforms to the standardized proctoring flag schema.
 * 
 * @param {Object} flag - Flag object to validate
 * @returns {boolean} True if flag is valid, false otherwise
 */
export function isValidProctoringFlag(flag) {
  if (!flag || typeof flag !== 'object') {
    return false;
  }

  const validTypes = Object.values(FLAG_TYPES);
  if (!validTypes.includes(flag.type)) {
    return false;
  }

  if (
    typeof flag.confidence !== 'number' ||
    Number.isNaN(flag.confidence) ||
    flag.confidence < 0 ||
    flag.confidence > 1
  ) {
    return false;
  }

  if (typeof flag.rule !== 'string' || flag.rule.trim() === '') {
    return false;
  }

  if (typeof flag.timestamp !== 'string' || flag.timestamp.trim() === '') {
    return false;
  }

  return true;
}
