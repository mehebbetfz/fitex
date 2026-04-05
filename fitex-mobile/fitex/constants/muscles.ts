// Полная карта всех muscleImages с их данными
export const ALL_MUSCLES: { [key: string]: { name: string; group: string } } = {
	// Грудь
	leftPectoralisMajor: { name: 'Левая большая грудная', group: 'Грудь' },
	rightPectoralisMajor: { name: 'Правая большая грудная', group: 'Грудь' },
	leftPectoralisMinor: { name: 'Левая малая грудная', group: 'Грудь' },
	rightPectoralisMinor: { name: 'Правая малая грудная', group: 'Грудь' },
	rightSerratusAnterior: { name: 'Правая передняя зубчатая', group: 'Грудь' },
	leftSerratusAnterior: { name: 'Левая передняя зубчатая', group: 'Грудь' },

	// Пресс
	upperAbs: { name: 'Верхний пресс', group: 'Пресс' },
	lowerAbs: { name: 'Нижний пресс', group: 'Пресс' },
	upperMiddleAbs: { name: 'Средний пресс (верх)', group: 'Пресс' },
	lowerMiddleAbs: { name: 'Средний пресс (низ)', group: 'Пресс' },
	leftExternalOblique: { name: 'Левая внешняя косая', group: 'Пресс' },
	rightExternalOblique: { name: 'Правая внешняя косая', group: 'Пресс' },
	leftInternalOblique: { name: 'Левая внутренняя косая', group: 'Пресс' },
	rightInternalOblique: { name: 'Правая внутренняя косая', group: 'Пресс' },
	leftTransversusAbdominis: { name: 'Левая поперечная живота', group: 'Пресс' },
	rightTransversusAbdominis: { name: 'Правая поперечная живота', group: 'Пресс' },

	// Бицепс
	leftLongBiceps: { name: 'Левая длинная головка бицепса', group: 'Бицепс' },
	rightLongBiceps: { name: 'Правая длинная головка бицепса', group: 'Бицепс' },
	leftShortBiceps: { name: 'Левая короткая головка бицепса', group: 'Бицепс' },
	rightShortBiceps: { name: 'Правая короткая головка бицепса', group: 'Бицепс' },

	// Плечи (дельты)
	leftFrontDeltoid: { name: 'Левая передняя дельта', group: 'Плечи' },
	rightFrontDeltoid: { name: 'Правая передняя дельта', group: 'Плечи' },
	leftMiddleDeltoid: { name: 'Левая средняя дельта', group: 'Плечи' },
	rightMiddleDeltoid: { name: 'Правая средняя дельта', group: 'Плечи' },
	leftRearDeltoid: { name: 'Левая задняя дельта', group: 'Плечи' },
	rightRearDeltoid: { name: 'Правая задняя дельта', group: 'Плечи' },

	// Трапеции
	leftUpperTrapezius: { name: 'Левая верхняя трапеция', group: 'Трапеции' },
	rightUpperTrapezius: { name: 'Правая верхняя трапеция', group: 'Трапеции' },
	leftLowerTrapezius: { name: 'Левая нижняя трапеция', group: 'Трапеции' },
	rightLowerTrapezius: { name: 'Правая нижняя трапеция', group: 'Трапеции' },

	// Ноги
	leftVastusLateralis: { name: 'Левая латеральная широкая', group: 'Ноги' },
	rightVastusLateralis: { name: 'Правая латеральная широкая', group: 'Ноги' },
	leftVastusMedialis: { name: 'Левая медиальная широкая', group: 'Ноги' },
	rightVastusMedialis: { name: 'Правая медиальная широкая', group: 'Ноги' },
	leftVastusInternedius: { name: 'Левая промежуточная широкая', group: 'Ноги' },
	rightVastusInternedius: { name: 'Правая промежуточная широкая', group: 'Ноги' },
	leftGastrocnemius: { name: 'Левая икроножная', group: 'Ноги' },
	rightGastrocnemius: { name: 'Правая икроножная', group: 'Ноги' },
	leftTibialisAnterior: { name: 'Левая передняя большеберцовая', group: 'Ноги' },
	rightTibialisAnterior: { name: 'Правая передняя большеберцовая', group: 'Ноги' },
	leftBiceosFemoris: { name: 'Левая двуглавая бедра', group: 'Ноги' },
	rightBiceosFemoris: { name: 'Правая двуглавая бедра', group: 'Ноги' },
	leftSemitendinosus: { name: 'Левая полусухожильная', group: 'Ноги' },
	rightSemitendinosus: { name: 'Правая полусухожильная', group: 'Ноги' },

	// Ягодицы
	leftGluteusMaximus: { name: 'Левая большая ягодичная', group: 'Ягодицы' },
	rightGluteusMaximus: { name: 'Правая большая ягодичная', group: 'Ягодицы' },
	leftGluteusMedius: { name: 'Левая средняя ягодичная', group: 'Ягодицы' },
	rightGluteusMedius: { name: 'Правая средняя ягодичная', group: 'Ягодицы' },

	// Спина
	leftIntraspinatus: { name: 'Левая подостная', group: 'Спина' },
	rightIntraspinatus: { name: 'Правая подостная', group: 'Спина' },
	leftLatissimusDorsi: { name: 'Левая широчайшая', group: 'Спина' },
	rightLatissimusDorsi: { name: 'Правая широчайшая', group: 'Спина' },
	leftThoracolumbarFascia: { name: 'Левая поясничная фасция', group: 'Спина' },
	rightThoracolumbarFascia: { name: 'Правая поясничная фасция', group: 'Спина' },

	// Предплечья
	rightExtensorDigitorum: { name: 'Правый разгибатель пальцев', group: 'Предплечья' },
	leftExtensorDigitorum: { name: 'Левый разгибатель пальцев', group: 'Предплечья' },
	rightExtensorCarpiUharis: { name: 'Правый локтевой разгибатель запястья', group: 'Предплечья' },
	leftExtensorCarpiUharis: { name: 'Левый локтевой разгибатель запястья', group: 'Предплечья' },
	rightExtensorCarpiRadialis: { name: 'Правый лучевой разгибатель запястья', group: 'Предплечья' },
	leftExtensorCarpiRadialis: { name: 'Левый лучевой разгибатель запястья', group: 'Предплечья' },
	leftFlexorDigitorumProfundus: { name: 'Левый глубокий сгибатель пальцев', group: 'Предплечья' },
	leftFlexorPollicisLongus: { name: 'Левый длинный сгибатель большого пальца', group: 'Предплечья' },
	rightFlexorDigitorumProfundus: { name: 'Правый глубокий сгибатель пальцев', group: 'Предплечья' },
	rightFlexorPollicisLongus: { name: 'Правый длинный сгибатель большого пальца', group: 'Предплечья' },

	// Трицепс
	leftTriceps: { name: 'Левый трицепс', group: 'Трицепс' },
	rightTriceps: { name: 'Правый трицепс', group: 'Трицепс' },

	// Шея
	leftScalenes: { name: 'Левая лестничная', group: 'Шея' },
	rightScalenes: { name: 'Правая лестничная', group: 'Шея' },
}