import { Colors } from "@/constants/Colors";
import { API_ENDPOINTS, BASE_URL } from "@/constants/Endpoints";
import axios from "axios";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Signup() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const passwordRef = useRef<TextInput>(null);
	const usernameRef = useRef<TextInput>(null);

	type SignupFormData = {
		email: string;
		password: string;
		username: string;
	};

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupFormData>();

	const prepareNextScreen = (path: string) => {
		setIsLoading(true);
		try {
			router.replace(path as any);
		} catch (error) {
			console.error("Navigation error:", error);
			Toast.show({
				type: "error",
				text1: "Navigation Error",
				position: "top",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (data: SignupFormData) => {
		setIsLoading(true);
		try {
			await axios.post(`${BASE_URL}${API_ENDPOINTS.REGISTER}`, data, {
				headers: {
					"Content-Type": "application/json",
					"x-api-key": "reqres-free-v1",
				},
			});
			router.replace("/(auth)/Login");
			Toast.show({
				type: "success",
				text1: "Signup Successful",
				text2: "Log in with your credentials",
				position: "top",
			});
		} catch (error) {
			console.error("Signup error details:", error);

			if (axios.isAxiosError(error)) {
				const status = error.response?.status;

				if (status === 409) {
					Toast.show({
						type: "error",
						text1: "Signup Failed",
						text2: "Username or email already exists",
						position: "top",
					});
				} else if (status === 400) {
					Toast.show({
						type: "error",
						text1: "Signup Failed",
						text2: "Invalid input data",
						position: "top",
					});
				}
			} else {
				// Handle non-Axios errors (like a local JS crash)
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "An unexpected error occurred",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<Text style={styles.title}>Create an Account</Text>

				<Controller
					control={control}
					name="email"
					rules={{
						required: "Email is required",
						pattern: {
							value: /^\S+@\S+\.\S+$/,
							message: "Invalid email",
						},
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							style={styles.input}
							placeholder="Email"
							placeholderTextColor={Colors.placeHolder}
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							returnKeyType="next"
							onSubmitEditing={() => passwordRef.current?.focus()}
							autoCapitalize="none"
							testID="emailInput"
						/>
					)}
				/>
				{typeof errors.email?.message === "string" && (
					<Text style={styles.error}>{errors.email.message}</Text>
				)}

				<Controller
					control={control}
					name="password"
					rules={{ required: "Password is required", minLength: 8 }}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							ref={passwordRef}
							style={styles.input}
							placeholder="Password"
							placeholderTextColor={Colors.placeHolder}
							secureTextEntry
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							returnKeyType="next"
							onSubmitEditing={() => usernameRef.current?.focus()}
							autoCapitalize="none"
							testID="passwordInput"
						/>
					)}
				/>
				{typeof errors.password?.message === "string" && (
					<Text style={styles.error}>{errors.password.message}</Text>
				)}

				<Controller
					control={control}
					name="username"
					rules={{
						validate: (val) => {
							if (!val || val.length === 0) return true;
							if (val.length < 5) return "At least 5 characters";
							if (val.length > 20)
								return "No more than 20 characters";

							return true;
						},
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							ref={usernameRef}
							style={styles.input}
							placeholder="Username (optional)"
							placeholderTextColor={Colors.placeHolder}
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							returnKeyType="done"
							onSubmitEditing={handleSubmit(onSubmit)}
							autoCapitalize="none"
							testID="usernameInput"
						/>
					)}
				/>

				{isLoading ? (
					<ActivityIndicator
						style={styles.loader}
						color={Colors.tint}
					/>
				) : (
					<TouchableOpacity
						style={styles.button}
						onPress={handleSubmit(onSubmit)}
						testID="signupButton"
					>
						<Text style={styles.buttonText}>Sign Up</Text>
					</TouchableOpacity>
				)}

				<TouchableOpacity
					onPress={() => prepareNextScreen("/(auth)/Login")}
				>
					<Text style={styles.backText}>
						Already have an account? Login
					</Text>
				</TouchableOpacity>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: "center",
		backgroundColor: Colors.background,
	},

	title: {
		fontSize: 22,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 32,
		color: Colors.text,
	},

	input: {
		backgroundColor: "#1d1f20",
		color: Colors.text,
		borderRadius: 10,
		padding: 14,
		fontSize: 16,
		borderColor: "#2a2d2f",
		borderWidth: 1,
		marginBottom: 16,
	},

	button: {
		backgroundColor: Colors.tint,
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 10,
	},

	buttonText: {
		color: Colors.text,
		fontSize: 16,
		fontWeight: "bold",
		letterSpacing: 1,
	},

	loader: {
		marginTop: 10,
	},

	backText: {
		marginTop: 24,
		textAlign: "center",
		color: Colors.icon,
		fontSize: 14,
		textDecorationLine: "underline",
	},

	error: {
		color: Colors.error,
		marginBottom: 12,
		fontSize: 13,
	},
});
