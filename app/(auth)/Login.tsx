import { Colors } from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Login() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const passwordRef = useRef<TextInput>(null);

	type LoginFormData = {
		identifier: string;
		password: string;
	};

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>();

	const prepareNextScreen = (path: string) => {
		setLoading(true);
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
			setLoading(false);
		}
	};

	const onSubmit = async (data: LoginFormData) => {
		setLoading(true);
		try {
			await login(data.identifier, data.password);
			router.replace("/(MainApp)/Home");
		} catch (err: any) {
			if (err.response.status === 400) {
				console.error(
					"Login failed: Incorrect username/email or password"
				);
				Toast.show({
					type: "error",
					text1: "Login Failed",
					text2: "Incorrect username/email or password",
				});
				return;
			}

			console.error("Login error details:", err);
			Toast.show({
				type: "error",
				text1: "Server Error",
				text2: "Something went wrong!",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>Login</Text>

			<Controller
				control={control}
				name="identifier"
				rules={{ required: "Email or username is required" }}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						style={styles.input}
						placeholder="Email or Username"
						placeholderTextColor={Colors.placeHolder}
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						returnKeyType="next"
						onSubmitEditing={() => passwordRef.current?.focus()}
						autoCapitalize="none"
						testID="identifierInput"
					/>
				)}
			/>
			{errors.identifier && (
				<Text style={styles.error}>{errors.identifier.message}</Text>
			)}

			<Controller
				control={control}
				name="password"
				rules={{
					required: "Password is required",
					minLength: {
						value: 8,
						message: "Password must be at least 8 characters",
					},
				}}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						ref={passwordRef}
						style={styles.input}
						placeholder="Password"
						placeholderTextColor={Colors.placeHolder}
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						secureTextEntry
						returnKeyType="done"
						onSubmitEditing={handleSubmit(onSubmit)}
						autoCapitalize="none"
						testID="passwordInput"
					/>
				)}
			/>
			{errors.password && (
				<Text style={styles.error}>{errors.password.message}</Text>
			)}

			{loading ? (
				<ActivityIndicator color={Colors.icon} />
			) : (
				<TouchableOpacity
					onPress={handleSubmit(onSubmit)}
					style={styles.button}
					testID="loginButton"
				>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableOpacity>
			)}

			<TouchableOpacity
				onPress={() => prepareNextScreen("/(auth)/ForgotPassword")}
				style={styles.secondaryBtn}
			>
				<Text style={styles.secondaryBtnText}>Forgot Password?</Text>
			</TouchableOpacity>

			<View style={styles.footer}>
				<Text style={styles.text}>Don't have an account?</Text>
				<TouchableOpacity
					onPress={() => prepareNextScreen("/(auth)/Signup")}
				>
					<Text style={styles.link}> Signup</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
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
		borderBottomWidth: 1,
		borderBottomColor: "grey",
		padding: 12,
		marginBottom: 16,
		fontSize: 16,
		color: Colors.text,
	},
	button: {
		backgroundColor: Colors.tint,
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 8,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	secondaryBtn: {
		marginTop: 16,
		alignItems: "center",
	},
	secondaryBtnText: {
		color: Colors.icon,
		textDecorationLine: "underline",
		fontSize: 14,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 20,
	},
	text: {
		color: Colors.text,
		fontSize: 14,
	},
	link: {
		color: "#4A90E5",
		fontWeight: "bold",
		marginLeft: 5,
		textDecorationLine: "underline",
	},
	error: {
		color: Colors.error,
		fontSize: 13,
		marginBottom: 8,
	},
});
