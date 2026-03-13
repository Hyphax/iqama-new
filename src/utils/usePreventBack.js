import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from 'expo-router';

export const usePreventBack = () => {
	const navigation = useNavigation();

	useFocusEffect(() => {
		navigation.setOptions({
			headerLeft: () => null,
			gestureEnabled: false,
		});

		navigation.getParent()?.setOptions({ gestureEnabled: false });

		return () => {
			navigation.getParent()?.setOptions({ gestureEnabled: true });
			navigation.setOptions({
				gestureEnabled: true,
			});
		};
	});
};
export default usePreventBack;
