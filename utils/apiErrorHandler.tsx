export const getErrorMessage = (error: any): string => {
	console.error("Error:", error);

	const status = error.response?.status;
	const data = error.response?.data;

	switch (status) {
		case 400:
			return data?.message || "Invalid input. Please check your data.";
		case 401:
			return "Unauthorized. Please log in again.";
		case 404:
			return "Incorrect data";
		case 409:
			return "An account with this email or username already exists.";
		case 429:
			return "Too many attempts. Please try again later.";
		case 500:
			return "Server error. Our engineers are on it!";
		case 503:
			return "Service unavailable. Please try again later.";
		default:
			return "An unexpected error occurred. Please try again.";
	}
};
