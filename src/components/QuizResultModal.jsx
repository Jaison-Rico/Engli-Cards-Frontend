import React from 'react';
import { Modal, View, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { Button, Card, Typography } from 'heroui-native';

const { width, height } = Dimensions.get('window');

export default function QuizResultModal({
  visible,
  score = 0,
  total = 0,
  onOk,
  onReview,
  hasFailed = false,
  title = '¡Quiz Completado!',
  okText = 'Continuar',
  description,
  dismissible = false,
  onRequestClose,
}) {
  const isPerfect = score === total && total > 0;
  const message = description ?? `Has obtenido ${score} de ${total} respuestas correctas.${isPerfect ? ' ¡Excelente trabajo!' : ''}`;

  const handleRequestClose = () => {
    if (onRequestClose) return onRequestClose();
    if (onOk) return onOk();
  };

  return (
    <Modal
      visible={!!visible}
      transparent
      animationType="fade"
      onRequestClose={handleRequestClose}
    >
      <View
        className="absolute inset-0 bg-backdrop items-center justify-center px-8"
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Card className="w-full">
          <Card.Body className="items-center px-6 py-8 gap-4">
            <Typography type="h4" weight="bold" align="center">
              {isPerfect ? '🏆 ¡Perfecto!' : title}
            </Typography>
            <Typography type="body-sm" color="muted" align="center" className="mb-2">
              {message}
            </Typography>

            <Button size="lg" className="w-full" onPress={onOk}>
              <Button.Label>{okText}</Button.Label>
            </Button>

            {!isPerfect && hasFailed && (
              <Button variant="outline" size="lg" className="w-full" onPress={onReview}>
                <Button.Label>Repasar Errores</Button.Label>
              </Button>
            )}
          </Card.Body>
        </Card>

        {isPerfect && (
          <LottieView
            source={{ uri: 'https://assets5.lottiefiles.com/packages/lf20_u4y3uoxk.json' }}
            autoPlay
            loop={false}
            style={{
              position: 'absolute',
              width,
              height,
              zIndex: -1,
              pointerEvents: 'none',
            }}
          />
        )}
      </View>
    </Modal>
  );
}
