import React, { useCallback, useContext } from 'react';
import { LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import styled from 'styled-components/native';
import CloseIcon from './CloseIcon';
import {
  CLOSE_CARD_BUTTON_HEIGHT,
  CLOSE_OPEN_CARD_BUTTON_HITSLOP,
  MORPHING_ARROW_OFFSET,
  HEADER_HEIGHT,
  HIT_SLOP,
} from '../../../constants/styles';
import MorphingArrow from '../../../components/BottomSheet/MorphingArrow';
import { ReusablePropsContext } from '../../../containers/ReusablePropsProvider';
import { UserConfigurationContext } from '../../../containers/UserConfigurationProvider';

interface Props {
  snapPointBottom: Animated.SharedValue<number>;
  scrollY?: Animated.SharedValue<number>;
  onPress: () => void;
}

const TouchableOpacity = styled.TouchableOpacity<{
  borderTopRightRadius?: number;
  borderTopLeftRadius?: number;
  height: number;
}>`
  position: relative;
  display: flex;
  z-index: 2;
  background: transparent;
  height: ${({ height }): number => height}px;
`;

const HitSlopAreaWrapper = styled.View`
  background: transparent;
  top: -${CLOSE_OPEN_CARD_BUTTON_HITSLOP}px;
  height: ${CLOSE_OPEN_CARD_BUTTON_HITSLOP}px;
  width: 100%;
`;

const MorphingArrowWrapper = styled.View<{ offset: number }>`
  width: 100%;
  height: ${CLOSE_CARD_BUTTON_HEIGHT}px;
  top: ${({ offset }): string => `-${offset}`}px;
`;

const Wrapper = styled.View``;

const Header: React.FC<Props> = ({ snapPointBottom, scrollY, onPress }) => {
  const { headerComponent, header, morphingArrow, contentHeightWhenKeyboardIsVisible } =
    useContext(UserConfigurationContext);
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
    <TouchableOpacity height={height} activeOpacity={1} hitSlop={HIT_SLOP} onPress={onPress}>
      <HitSlopAreaWrapper />
      <Wrapper onLayout={onLayout}>
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
    </TouchableOpacity>
  );
};

export default Header;
