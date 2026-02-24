import { Colors } from "@/constants/Colors";
import React, { ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AuthLayoutProps {
	children: ReactNode;
	title: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
	return (
		<SafeAreaView style={styles.screen}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.container}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContainer}
					keyboardShouldPersistTaps="handled"
				>
					<Text style={styles.title}>{title}</Text>
					{children}
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	container: {
		flex: 1,
	},
	scrollContainer: {
		flexGrow: 1,
		padding: 24,
		justifyContent: "center",
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 32,
		color: Colors.text,
	},
});
