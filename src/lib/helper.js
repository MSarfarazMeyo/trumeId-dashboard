import { notification } from "antd";

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export const extractErrorMessage = (error) => {
  // If error is Axios-like and has a nested response
  if (error?.response?.data) {
    const data = error.response.data;

    if (typeof data.message === "string") {
      return data.message;
    }

    if (typeof data.message === "object" && data.message.message) {
      return data.message.message;
    }

    if (data.error) {
      return data.error;
    }
  }

  // If message is nested in error.message.message
  if (error?.message?.message) {
    return error.message.message;
  }

  // If message is a string
  if (typeof error?.message === "string") {
    return error.message;
  }

  return "Something went wrong. Please try again!";
};

export const showError = (message, description) => {
  try {
    notification.error({
      message: message || "Error",
      ...(description && { description }),
      placement: "topRight",
      duration: 30,
    });
  } catch (error) {
    console.log(error);
  }
};

export const showInfo = (message, description) => {
  notification.info({
    message: message || "Information",
    ...(description && { description }),

    placement: "topRight", // Customize where the notification appears
    duration: 3, // Duration in seconds
  });
};

export const showSuccess = (message, description) => {
  notification.success({
    message: message || "Success",
    ...(description && { description }),
    placement: "topRight", // Customize where the notification appears
    duration: 3, // Duration in seconds
  });
};
