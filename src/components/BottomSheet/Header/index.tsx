import React, { useCallback, useContext } from 'react';
import { LayoutChangeEvent, Platform } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import styled from 'styled-components/native';
import CloseIcon from './CloseIcon';
import {
  CLOSE_CARD_BUTTON_HEIGHT,
  CLOSE_OPEN_CARD_BUTTON_HITSLOP,
  DEFAULT_BORDER_RADIUS,
  MORPHING_ARROW_OFFSET,
  HEADER_HEIGHT,
  HIT_SLOP,
} from '../../../constants/styles';
import MorphingArrow from '../../../components/BottomSheet/MorphingArrow';
import { ReusablePropsContext } from '../../../containers/ReusablePropsProvider';
import { UserConfigurationContext } from '../../../containers/UserConfigurationProvider';
import type { BottomSheetConfiguration } from '../../../types';

const isWeb = Platform.OS === 'web';
const SHADOW_WRAPPER_HEIGHT = 16;

interface Props {
  snapPointBottom: Animated.SharedValue<number>;
  scrollY?: Animated.SharedValue<number>;
  onPress: () => void;
}

const TouchableOpacity = styled.TouchableOpacity<{
  height: number;
  safeAreaToContent?: number;
}>`
  position: absolute;
  display: flex;
  width: 100%;
  z-index: 2;
  top: -${({ safeAreaToContent }): number => safeAreaToContent ?? CLOSE_OPEN_CARD_BUTTON_HITSLOP}px;
  height: ${({ height }): number => height}px;
  background-color: transparent;
`;

const MorphingArrowWrapper = styled.View<{ offset: number }>`
  width: 100%;
  height: ${CLOSE_CARD_BUTTON_HEIGHT}px;
  top: ${({ offset }): string => `-${offset}`}px;
`;

const ShadowWrapper = styled.View<{ webBoxShadow: BottomSheetConfiguration['webBoxShadow'] }>`
  position: absolute;
  z-index: -1;
  width: 100%;
  height: ${SHADOW_WRAPPER_HEIGHT}px;
  border-top-right-radius: ${DEFAULT_BORDER_RADIUS}px;
  border-top-left-radius: ${DEFAULT_BORDER_RADIUS}px;
  top: ${({ webBoxShadow }): number => webBoxShadow?.offset ?? -3}px;
  background-color: rgba(0, 0, 0, ${({ webBoxShadow }): number => webBoxShadow?.opacity ?? 0.25});
`;

const Wrapper = styled.View<{ height: number; backgroundColor?: string }>`
  z-index: 1;
  height: ${({ height }): number => height}px;
  background-color: ${({ backgroundColor }): string => backgroundColor ?? 'lightgrey'};
  border-top-left-radius: ${DEFAULT_BORDER_RADIUS}px;
  border-top-right-radius: ${DEFAULT_BORDER_RADIUS}px;
`;

const Header: React.FC<Props> = ({ snapPointBottom, scrollY, onPress }) => {
  const {
    headerComponent,
    backgroundColor,
    header,
    morphingArrow,
    contentHeightWhenKeyboardIsVisible,
    webBoxShadow,
    safeAreaToContent,
  } = useContext(UserConfigurationContext);
  const { headerHeight, isKeyboardVisible } = useContext(ReusablePropsContext.bottomSheet);

  const offset = morphingArrow?.offset ?? MORPHING_ARROW_OFFSET;
  const height = header?.height ?? HEADER_HEIGHT;

  const onLayout = useCallback(
    (e: LayoutChangeEvent): void => {
      if (e.nativeEvent.layout.height > 0) {
        headerHeight.value = e.nativeEvent.layout.height;
      }
    },
    [headerHeight],
  );

  const animatedStyleWhenKeyboardIsVisible = useAnimatedStyle(() => ({
    transform: [{ scale: isKeyboardVisible?.value ? 1 : 0 }],
  }));

  const { takeUpAllAvailableSpace, closeIcon } = contentHeightWhenKeyboardIsVisible ?? {};
  const hasCloseIcon = takeUpAllAvailableSpace && closeIcon;

  const animatedStyleWhenKeyboardIsHidden = useAnimatedStyle(() => ({
    transform: [{ scale: isKeyboardVisible?.value && hasCloseIcon ? 0 : 1 }],
  }));

  return (
    <>
      <TouchableOpacity
        safeAreaToContent={safeAreaToContent}
        height={height}
        activeOpacity={1}
        hitSlop={HIT_SLOP}
        onPress={onPress}
      />
      <Wrapper onLayout={onLayout} height={height} backgroundColor={backgroundColor}>
        {hasCloseIcon && (
          <Animated.View style={animatedStyleWhenKeyboardIsVisible}>
            <CloseIcon onPress={onPress} />
          </Animated.View>
        )}
        <Animated.View style={animatedStyleWhenKeyboardIsHidden}>
          {headerComponent ?? (
            <MorphingArrowWrapper offset={offset}>
              <MorphingArrow snapPointBottom={snapPointBottom} scrollY={scrollY} />
            </MorphingArrowWrapper>
          )}
        </Animated.View>
      </Wrapper>
      {isWeb && <ShadowWrapper webBoxShadow={webBoxShadow} />}
    </>
  );
};

export default Header;
