import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, memo, useState } from "react";
import { Control, Controller } from "react-hook-form";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TextInputProps,
	View,
} from "react-native";

export const ErrorMessage = memo(
	({ message, isServer }: { message?: string; isServer?: boolean }) => {
		if (!message) return null;
		return (
			<Text style={[styles.error, isServer && styles.serverError]}>
				{isServer ? `⚠️ ${message}` : message}
			</Text>
		);
	}
);
ErrorMessage.displayName = "ErrorMessage";

interface SubmitButtonProps {
	loading: boolean;
	onPress: () => void;
	title: string;
	testID: string;
}

export const SubmitButton = memo(
	({ loading, onPress, title, testID }: SubmitButtonProps) => (
		<Pressable
			onPress={onPress}
			style={styles.button}
			disabled={loading}
			testID={testID}
		>
			{loading ? (
				<ActivityIndicator color="#fff" />
			) : (
				<Text style={styles.buttonText}>{title}</Text>
			)}
		</Pressable>
	)
);
SubmitButton.displayName = "SubmitButton";

interface FormInputProps extends TextInputProps {
	control: Control<any>;
	name: string;
	rules?: object;
}

export const FormInput = memo(
	forwardRef<TextInput, FormInputProps>(
		({ control, name, rules, style, secureTextEntry, ...props }, ref) => {
			const [isPasswordVisible, setIsPasswordVisible] = useState(false);

			// Only show the eye icon if the input is meant to be a password
			const isPasswordType = secureTextEntry;

			return (
				<Controller
					control={control}
					name={name}
					rules={rules}
					render={({ field: { onChange, onBlur, value } }) => (
						<View>
							<TextInput
								ref={ref}
								style={[
									styles.input,
									isPasswordType && { paddingRight: 50 },
									style,
								]}
								placeholderTextColor={Colors.placeHolder}
								onBlur={onBlur}
								onChangeText={(text) => onChange(text.trim())}
								blurOnSubmit={false}
								value={value?.toString()}
								secureTextEntry={
									isPasswordType && !isPasswordVisible
								}
								{...props}
							/>
							{isPasswordType && (
								<Pressable
									onPress={() =>
										setIsPasswordVisible(!isPasswordVisible)
									}
									style={styles.iconContainer}
								>
									<Ionicons
										name={
											isPasswordVisible
												? "eye-off-outline"
												: "eye-outline"
										}
										size={22}
										color={Colors.icon}
									/>
								</Pressable>
							)}
						</View>
					)}
				/>
			);
		}
	)
);

const styles = StyleSheet.create({
	input: {
		backgroundColor: Colors.inputBackground,
		color: Colors.text,
		borderRadius: 10,
		padding: 14,
		fontSize: 16,
		borderColor: Colors.border,
		borderWidth: 1,
		marginBottom: 16,
	},
	button: {
		backgroundColor: Colors.tint,
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 8,
	},
	buttonText: {
		color: Colors.text,
		fontSize: 16,
		fontWeight: "bold",
	},
	error: {
		color: Colors.error,
		fontSize: 13,
		marginBottom: 8,
	},
	serverError: {
		backgroundColor: Colors.serverError,
		padding: 10,
		borderRadius: 5,
		textAlign: "center",
		overflow: "hidden",
		marginBottom: 16,
	},
	iconContainer: {
		position: "absolute",
		right: 14,
		top: 14,
		height: 24,
		justifyContent: "center",
	},
});
