/**
 * Extract student name from certificate filename
 * 
 * Example input: Certificate_Afnan_Abbas_Abdelaziz_Abbas_20260729NUTZPE.pdf
 * Example output: Afnan Abbas Abdelaziz Abbas
 */

function extractNameFromFileName(fileName) {
  try {
    // Remove file extension
    let nameWithoutExt = fileName.replace(/\.pdf$/i, '');
    
    // Remove "Certificate_" prefix (case insensitive)
    nameWithoutExt = nameWithoutExt.replace(/^Certificate_/i, '');
    
    // Remove date and random code suffix
    // Pattern: _YYYYMMDD followed by alphanumeric characters
    nameWithoutExt = nameWithoutExt.replace(/_\d{8}[A-Z0-9]+$/i, '');
    
    // Replace underscores with spaces
    const name = nameWithoutExt.replace(/_/g, ' ');
    
    // Trim and normalize whitespace
    return name.trim().replace(/\s+/g, ' ');
    
  } catch (error) {
    console.error('Error extracting name from filename:', fileName, error);
    return null;
  }
}

module.exports = {
  extractNameFromFileName
};
