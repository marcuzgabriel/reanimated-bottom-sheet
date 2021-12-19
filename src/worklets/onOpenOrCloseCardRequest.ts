import Animated, { withSpring } from 'react-native-reanimated';
import { scrollToPosition } from '../helpers';
import { DEFAULT_SPRING_CONFIG } from '../constants/animations';
import type { ContextPropsBottomSheet, BottomSheetConfiguration } from '../types';

type UnionContextPropsBottomSheetTypes = 'scrollViewRef' | 'scrollY' | 'translationY';
type UnionBottomSheetConfigurationTypes =
  | 'snapEffectDirection'
  | 'closeBottomSheetRequest'
  | 'openBottomSheetRequest';

type OnOpenOrCloseCardRequestParams = Pick<
  ContextPropsBottomSheet,
  UnionContextPropsBottomSheetTypes
> &
  Pick<BottomSheetConfiguration, UnionBottomSheetConfigurationTypes> & {
    snapPointBottom: number;
    isAnimationRunning: Animated.SharedValue<boolean>;
    isCardCollapsed: Animated.SharedValue<boolean>;
  };

type ResetCardAndSlideToTopOrBottomParams = Omit<
  OnOpenOrCloseCardRequestParams,
  'closeBottomSheetRequest' | 'openBottomSheetRequest'
> & {
  slideDirection: string;
};

const resetCardAndSlideToTopOrBottom = ({
  snapEffectDirection,
  scrollViewRef,
  scrollY,
  slideDirection,
  isAnimationRunning,
  isCardCollapsed,
  translationY,
  snapPointBottom,
}: ResetCardAndSlideToTopOrBottomParams): void => {
  'worklet';

  if (snapEffectDirection) {
    snapEffectDirection.value = '';
  }

  if (scrollViewRef?.current && scrollY.value > 0) {
    scrollToPosition({ ref: scrollViewRef, to: 'top' });
  }

  isAnimationRunning.value = true;

  translationY.value = withSpring(
    slideDirection === 'bottom' ? snapPointBottom : 0,
    DEFAULT_SPRING_CONFIG,
    isAnimationDone => {
      if (isAnimationDone) {
        isAnimationRunning.value = false;
      }
    },
  );

  isCardCollapsed.value = slideDirection === 'bottom';
};

export const onOpenOrCloseCardRequest = ({
  closeBottomSheetRequest,
  openBottomSheetRequest,
  isCardCollapsed,
  ...rest
}: OnOpenOrCloseCardRequestParams): void => {
  'worklet';

  if (closeBottomSheetRequest?.isEnabled && !isCardCollapsed.value) {
    closeBottomSheetRequest.callback(() => {
      resetCardAndSlideToTopOrBottom({
        ...rest,
        isCardCollapsed,
        slideDirection: 'bottom',
      });
    });
  } else if (openBottomSheetRequest?.isEnabled && isCardCollapsed.value) {
    openBottomSheetRequest.callback(() => {
      resetCardAndSlideToTopOrBottom({
        ...rest,
        isCardCollapsed,
        slideDirection: 'top',
      });
    });
  }
};
