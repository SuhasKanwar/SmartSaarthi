import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  useSharedValue, 
  ZoomIn,
  FadeIn
} from 'react-native-reanimated';
import { Palette } from '@/constants/theme';
import navigationConfig from '@/constants/navigationConfig.json';

const { width } = Dimensions.get('window');

const TabItem = ({ 
  route, 
  isFocused, 
  options, 
  onPress, 
  configItem 
}: { 
  route: any, 
  isFocused: boolean, 
  options: any, 
  onPress: () => void, 
  configItem: any 
}) => {
  
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      flex: withSpring(isFocused ? 2 : 1, { damping: 15, stiffness: 100 }),
      backgroundColor: withTiming(isFocused ? Palette.green : 'transparent', { duration: 200 }),
      transform: [{ scale: withSpring(isFocused ? 1 : 0.9) }]
    };
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
     return {
         color: withTiming(isFocused ? '#ffffff' : '#b0b0b0'),
     }
  }, [isFocused]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      onPress={onPress}
      style={styles.touchableArea}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.tabItem, animatedContainerStyle]}>
        <Ionicons
          name={configItem.icon as any}
          size={24}
          color={isFocused ? '#fff' : '#ccc'}
          style={{ marginRight: isFocused ? 8 : 0 }}
        />
        {isFocused && (
          <Animated.Text entering={FadeIn.duration(200)} numberOfLines={1} style={styles.label}>
            {configItem.label}
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Filter routes
  const validRoutes = state.routes.filter(route => 
    navigationConfig.some(config => config.route === route.name)
  );

  if (validRoutes.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {validRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          // Check if this route is focused by comparing keys
          const currentActiveKey = state.routes[state.index].key;
          const isRouteFocused = currentActiveKey === route.key;

          const configItem = navigationConfig.find(item => item.route === route.name);
          if (!configItem) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isRouteFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TabItem 
                key={route.key}
                route={route}
                isFocused={isRouteFocused}
                options={options}
                onPress={onPress}
                configItem={configItem}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30, // Floating
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Palette.blueSecondary,
    borderRadius: 35,
    padding: 6,
    width: Math.min(width * 0.85, 400),
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  touchableArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
    height: '100%',
    width: '100%',
  },
  label: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    includeFontPadding: false,
  },
});
