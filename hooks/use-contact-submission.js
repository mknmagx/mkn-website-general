import { useState } from "react";
import { validateAndSubmitContact } from "../lib/services/contact-service";

/**
 * İletişim formu için custom hook
 * @returns {Object} Form submit state ve fonksiyonları
 */
export const useContactSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  /**
   * Form verilerini submit eder
   * @param {Object} formData - Form verisi
   * @returns {Promise<Object>} Submit sonucu
   */
  const submitForm = async (formData) => {
    setIsSubmitting(true);
    setSubmitResult(null);
    setShowSubmissionModal(true);

    try {
      const result = await validateAndSubmitContact(formData);
      setSubmitResult(result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error.message,
        message: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
      };
      setSubmitResult(errorResult);
      return errorResult;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Modal'ı kapatır
   */
  const handleCloseModal = () => {
    setShowSubmissionModal(false);
    setSubmitResult(null);
  };

  /**
   * Form tekrar gönderilmesi için state'i sıfırlar
   */
  const handleRetrySubmission = () => {
    setShowSubmissionModal(false);
    setSubmitResult(null);
    setIsSubmitting(false);
  };

  /**
   * Submit sonucunu temizler
   */
  const clearResult = () => {
    setSubmitResult(null);
  };

  /**
   * Loading state'ini temizler
   */
  const resetSubmission = () => {
    setIsSubmitting(false);
    setSubmitResult(null);
    setShowSubmissionModal(false);
  };

  return {
    isSubmitting,
    submitResult,
    submitForm,
    clearResult,
    resetSubmission,
    showSubmissionModal,
    handleCloseModal,
    handleRetrySubmission,
    // Derived states
    isSuccess: submitResult?.success === true,
    isError: submitResult?.success === false,
    hasErrors:
      submitResult?.errors && Object.keys(submitResult.errors).length > 0,
    errorMessage: submitResult?.message || null,
    successMessage: submitResult?.success ? submitResult.message : null,
  };
};

export default useContactSubmission;
