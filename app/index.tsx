import { Colors } from "@/constants/Colors";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: Colors.background,
			}}
		>
			<ActivityIndicator size="large" color={Colors.tint} />
		</View>
	);
}
