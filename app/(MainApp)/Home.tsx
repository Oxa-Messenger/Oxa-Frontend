import { Colors } from "@/constants/Colors";
import { API_ENDPOINTS, BASE_URL } from "@/constants/Endpoints";
import { useSocket } from "@/hooks/SocketContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/UserDataContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type Contact = {
	user?: string;
	alias?: string;
};
type Contacts = Array<Contact>;

function MenuItem({
	label,
	icon,
	onPress,
}: {
	label: string;
	icon: any;
	onPress: () => void;
}) {
	return (
		<Pressable style={styles.menuItem} onPress={onPress}>
			<Ionicons name={icon} size={20} color={Colors.text} />
			<Text style={styles.menuText}>{label}</Text>
		</Pressable>
	);
}

export default function HomeScreen() {
	const { token, logout } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const { userData, setUserData } = useUserData();
	const [contacts, setContacts] = useState<Contacts>([]);
	const { initSocket } = useSocket();

	const [menuVisible, setMenuVisible] = useState(false);
	const [selectedContact, setSelectedContact] = useState<Contact | null>(
		null
	);
	const [contactMenuVisible, setContactMenuVisible] = useState(false);

	// Add Contact Modal State
	const [addModalVisible, setAddModalVisible] = useState(false);
	const [contactIdentifier, setContactIdentifier] = useState("");
	const [adding, setAdding] = useState(false);

	// Update Alias Modal State
	const [aliasModalVisible, setAliasModalVisible] = useState(false);
	const [aliasInput, setAliasInput] = useState("");

	useEffect(() => {
		if (token === null) return;

		const fetchUserData = async () => {
			try {
				setLoading(true);
				const res = await axios.get(
					`${BASE_URL}${API_ENDPOINTS.USER_HOME}`,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (res.data.success) {
					setUserData(res.data.message);
					setContacts(res.data.message.contacts || []);
				} else throw new Error("Failed to fetch user data");
			} catch (error) {
				Toast.show({
					type: "error",
					text1: "Failed to fetch user data",
					text2: "Please try again later.",
					position: "top",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [token]);

	useEffect(() => {
		if (userData?.userId) {
			initSocket({
				userId: String(userData.userId),
				token: token ?? undefined,
			});
		}
	}, [userData]);

	const handleLogout = async () => {
		await logout();
		router.replace("/(auth)/Login");
	};

	const renderContactItem = ({ item }: { item: Contact }) => {
		const handlePress = () => {
			// normalizedUser stored _id above, use that
			const myId = userData?.userId ?? null;
			if (!myId || !item.user) return;

			router.push({
				pathname: "/(MainApp)/ChatOneToOne",
				params: {
					userId: String(myId),
					otherUserId: String(item.user),
				},
			});
		};

		const handleLongPress = () => {
			setSelectedContact(item);
			setContactMenuVisible(true);
		};

		return (
			<Pressable
				onPress={handlePress}
				onLongPress={handleLongPress}
				delayLongPress={350}
				style={styles.contactItem}
			>
				<Text style={styles.contactAlias}>
					{item.alias || "Unnamed contact"}
				</Text>
			</Pressable>
		);
	};

	const addContact = async (identifier: string) => {
		if (!identifier.trim()) {
			Toast.show({
				type: "error",
				text1: "Enter email or username",
			});
			return;
		}

		try {
			setAdding(true);

			await axios.post(
				`${BASE_URL}${API_ENDPOINTS.ADD_CONTACT}`,
				{ identifier },
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			Toast.show({ type: "success", text1: "Contact added" });

			setAddModalVisible(false);
			setContactIdentifier("");

			// best practice: re-fetch home data
			setLoading(true);
			const res = await axios.get(
				`${BASE_URL}${API_ENDPOINTS.USER_HOME}`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);
			if (res.data.success) {
				setContacts(res.data.message.contacts || []);
			}
		} catch (err: any) {
			Toast.show({
				type: "error",
				text1: err?.response?.data?.message || "Failed to add contact",
			});
		} finally {
			setAdding(false);
			setLoading(false);
		}
	};

	const handleUpdateAlias = async () => {
		if (!selectedContact?.user || !aliasInput.trim()) {
			Toast.show({
				type: "error",
				text1: "Alias cannot be empty",
			});
			return;
		}

		try {
			await axios.put(
				`${BASE_URL}${API_ENDPOINTS.UPDATE_CONTACT_ALIAS}`,
				{
					user: selectedContact.user,
					alias: aliasInput.trim(),
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			// Update local state
			setContacts((prev) =>
				prev.map((c) =>
					c.user === selectedContact.user
						? { ...c, alias: aliasInput.trim() }
						: c
				)
			);

			Toast.show({
				type: "success",
				text1: "Alias updated",
			});

			setAliasModalVisible(false);
			setSelectedContact(null);
		} catch (err) {
			Toast.show({
				type: "error",
				text1: "Failed to update alias",
			});
		}
	};

	const handleDeleteContact = async (contact: Contact | null) => {
		if (!contact?.user) return;

		try {
			await axios.delete(`${BASE_URL}${API_ENDPOINTS.DELETE_CONTACT}`, {
				data: { user: contact.user },
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			setContacts((prev) => prev.filter((c) => c.user !== contact.user));

			Toast.show({
				type: "success",
				text1: "Contact removed",
			});
		} catch {
			Toast.show({
				type: "error",
				text1: "Failed to remove contact",
			});
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: userData?.username || userData?.email || "Home",
					headerTitleAlign: "left",
					headerStyle: { backgroundColor: Colors.background },
					headerTintColor: Colors.text,
					headerRight: () => (
						<View style={{ flexDirection: "row", gap: 16 }}>
							{/* Profile icon */}
							<TouchableOpacity
								onPress={() =>
									router.push("/(MainApp)/Profile")
								}
							>
								<Ionicons
									name="person-circle-outline"
									size={26}
									color={Colors.text}
								/>
							</TouchableOpacity>

							{/* Menu icon */}
							<TouchableOpacity
								onPress={() => setMenuVisible(true)}
							>
								<Ionicons
									name="ellipsis-vertical"
									size={22}
									color={Colors.text}
								/>
							</TouchableOpacity>
						</View>
					),
				}}
			/>

			<View>
				<Text style={styles.title}>{"Contacts"}</Text>
				{loading ? (
					<ActivityIndicator size="small" color={Colors.tint} />
				) : (
					<FlatList
						data={contacts}
						keyExtractor={(item) =>
							typeof item === "string"
								? item
								: item.user ?? String(Math.random())
						}
						renderItem={renderContactItem}
						ListEmptyComponent={
							<Text style={styles.text}>No contacts found</Text>
						}
					/>
				)}
			</View>

			<Modal
				visible={addModalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setAddModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Add Contact</Text>

						<TextInput
							placeholder="Username or Email"
							placeholderTextColor="#888"
							value={contactIdentifier}
							onChangeText={setContactIdentifier}
							style={styles.input}
							autoCapitalize="none"
							autoCorrect={false}
						/>

						<View style={styles.modalActions}>
							<Pressable
								onPress={() => setAddModalVisible(false)}
								style={[styles.modalButton, styles.cancel]}
							>
								<Text style={styles.modalButtonText}>
									Cancel
								</Text>
							</Pressable>

							<Pressable
								onPress={() => addContact(contactIdentifier)}
								style={[styles.modalButton, styles.confirm]}
								disabled={adding}
							>
								<Text style={styles.modalButtonText}>
									{adding ? "Adding..." : "Add"}
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
			<Modal
				visible={menuVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setMenuVisible(false)}
			>
				<Pressable
					style={styles.menuOverlay}
					onPress={() => setMenuVisible(false)}
				>
					<View style={styles.menu}>
						<MenuItem
							label="Add Contact"
							icon="person-add-outline"
							onPress={() => {
								setMenuVisible(false);
								setAddModalVisible(true);
							}}
						/>
						<MenuItem
							label="Logout"
							icon="log-out-outline"
							onPress={handleLogout}
						/>
					</View>
				</Pressable>
			</Modal>
			<Modal
				visible={contactMenuVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setContactMenuVisible(false)}
			>
				<Pressable
					style={styles.menuOverlay}
					onPress={() => setContactMenuVisible(false)}
				>
					<View style={styles.menu}>
						<MenuItem
							label="Update Alias"
							icon="create-outline"
							onPress={() => {
								setContactMenuVisible(false);
								setAliasInput(selectedContact?.alias || "");
								setAliasModalVisible(true);
							}}
						/>

						<MenuItem
							label="Delete Contact"
							icon="trash-outline"
							onPress={() => {
								setContactMenuVisible(false);
								handleDeleteContact(selectedContact);
							}}
						/>
					</View>
				</Pressable>
			</Modal>
			<Modal
				visible={aliasModalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setAliasModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Update Alias</Text>

						<TextInput
							placeholder="Enter alias"
							placeholderTextColor="#888"
							value={aliasInput}
							onChangeText={setAliasInput}
							style={styles.input}
							autoCapitalize="words"
						/>

						<View style={styles.modalActions}>
							<Pressable
								style={[styles.modalButton, styles.cancel]}
								onPress={() => setAliasModalVisible(false)}
							>
								<Text style={styles.modalButtonText}>
									Cancel
								</Text>
							</Pressable>

							<Pressable
								style={[styles.modalButton, styles.confirm]}
								onPress={() => handleUpdateAlias()}
							>
								<Text style={styles.modalButtonText}>Save</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
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
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 12,
		color: Colors.text,
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 32,
		color: Colors.text,
	},
	text: {
		color: Colors.text,
		fontSize: 14,
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
	content: {
		padding: 16,
		borderRadius: 10,
		marginVertical: 8,
		marginHorizontal: 16,
	},
	contactItem: {
		padding: 16,
		borderRadius: 10,
		marginVertical: 6,
		marginHorizontal: 8,
		backgroundColor: "#1c1c1c",
	},
	contactAlias: {
		color: Colors.text,
		fontSize: 16,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.6)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: "85%",
		backgroundColor: Colors.background,
		borderRadius: 12,
		padding: 20,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: Colors.text,
		marginBottom: 12,
	},
	input: {
		borderWidth: 1,
		borderColor: "#333",
		borderRadius: 8,
		padding: 12,
		color: Colors.text,
		marginBottom: 16,
	},
	modalActions: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	modalButton: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginLeft: 8,
	},
	cancel: {
		backgroundColor: "#444",
	},
	confirm: {
		backgroundColor: Colors.tint,
	},
	modalButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	menuOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "flex-start",
		alignItems: "flex-end",
		paddingTop: 60,
		paddingRight: 16,
	},
	menu: {
		backgroundColor: Colors.background,
		borderRadius: 12,
		paddingVertical: 8,
		minWidth: 180,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	menuText: {
		color: Colors.text,
		fontSize: 15,
	},
});
