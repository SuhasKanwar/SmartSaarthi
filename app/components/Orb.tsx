import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Palette } from '@/constants/theme';

const { width } = Dimensions.get('window');
const ORB_SIZE = width * 0.4;

export default function Orb({ active = true }: { active?: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(0.5);
    }
  }, [active]);

  const animatedOuterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  const animatedInnerStyle = useAnimatedStyle(() => {
     return {
         transform: [{ scale: scale.value }],
     }
  });

  return (
    <View style={styles.container}>
      {/* Outer Glow */}
      <Animated.View
         style={[
           styles.circle,
           {
             width: ORB_SIZE * 1.8,
             height: ORB_SIZE * 1.8,
             backgroundColor: Palette.blueSecondary,
             opacity: 0.2,
           },
           animatedOuterStyle,
         ]}
      />
       {/* Middle Glow */}
      <Animated.View
         style={[
           styles.circle,
           {
             width: ORB_SIZE * 1.4,
             height: ORB_SIZE * 1.4,
             backgroundColor: Palette.bluePrimary,
             opacity: 0.4,
           },
           animatedOuterStyle,
         ]}
      />
      {/* Core */}
      <Animated.View
        style={[
          styles.circle,
          {
            width: ORB_SIZE,
            height: ORB_SIZE,
            backgroundColor: Palette.green,
            shadowColor: Palette.green,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 10,
            borderWidth: 2,
            borderColor: '#fff',
          },
          animatedInnerStyle
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
});
