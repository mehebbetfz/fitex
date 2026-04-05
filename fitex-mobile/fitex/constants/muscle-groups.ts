import { manBackMuscleGroupParts, manFrontMuscleGroupParts } from './images'

export const muscle_groups = [
	{
		id: 'chest',
		name: 'Грудь',
		image: manFrontMuscleGroupParts.rectoralFull,
		position: { left: '-103%', top: '-150%' },
		subgroups: [
			{
				id: 'chest-upper',
				name: 'Верх груди',
				image: manFrontMuscleGroupParts.pectoralisMajor,
				exercises: [
					{
						id: 'flat-barbell-bench-press',
						name: 'Жим штанги лежа',
						description:
							'Базовое упражнение для развития силы и объема грудных мышц. Широкий хват позволяет максимально эффективно включить в работу большие грудные мышцы.',
						image: require('@/assets/training-videos/v1/v1.png'),
						imagePosition: {
							width: '140%',
							left: -30,
							scaleX: -1
						},
						images: [
							require('@/assets/training-videos/v1/v1.png'),
							require('@/assets/training-videos/v1/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_1.mp4',
						primaryMuscles: ['Середина груди'],
						secondaryMuscles: ['Передние дельты', 'Трицепс', 'Верх груди', 'Низ груди'],
						primaryFrontMuscles: ['rightPectoralisMinor', 'leftPectoralisMinor'],
						secondaryFrontMuscles: ['leftFrontDeltoid', 'rightFrontDeltoid', 'rightPectoralisMajor', 'leftPectoralisMajor', 'rightSerratusAnterior', 'leftSerratusAnterior'],
						primaryBackMuscles: [],
						secondaryBackMuscles: ['leftTriceps', 'rightTriceps'],
						tips: [
							'Сводите лопатки вместе, создавая стабильную опору для плеч',
							'Хват шире плеч (примерно на 1.5 ширины плеч для комфортной амплитуды)',
							'Опускайте штангу на уровень нижней части грудных мышц',
							'Держите стопы жестко упертыми в пол для передачи усилия',
							'Не отрывайте таз от скамьи во время выполнения жима',
						],
						equipment: ['Штанга', 'Горизонтальная скамья'],
						difficulty: 'Базовый',
					},
					{
						id: 'incline-barbell-bench-press',
						name: 'Жим штанги на наклонной скамье',
						description:
							'Классическое базовое упражнение для верхней части грудных. Максимально нагружает ключичную головку pectoralis major при правильном угле.',
						image: require('@/assets/training-videos/v3/v2.png'),
						imagePosition: {
							width: '140%',
							left: -30,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v3/v1.png'),
							require('@/assets/training-videos/v3/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_3.mp4',
						primaryMuscles: ['Верх груди'],
						secondaryMuscles: ['Передние дельты', 'Трицепс', 'Середина груди'],
						primaryFrontMuscles: [
							'rightPectoralisMajor', 'leftPectoralisMajor',
						],
						secondaryFrontMuscles: ['leftFrontDeltoid', 'rightFrontDeltoid', 'rightSerratusAnterior', 'leftSerratusAnterior',
							'rightPectoralisMinor', 'leftPectoralisMinor'
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: [
							'leftTriceps',
							'rightTriceps',
						],
						tips: [
							'Угол наклона скамьи 30–45 градусов (оптимально 30° для максимальной активации верха)',
							'Сводите лопатки и держите грудь расправленной',
							'Опускайте штангу к верхней части груди (чуть выше сосков)',
							'Локти под углом ~45° к корпусу',
							'Не выгибайте поясницу чрезмерно',
						],
						equipment: ['Штанга', 'Наклонная скамья'],
						difficulty: 'Средний',
					},
					{
						id: 'machine-pec-deck-fly',
						name: 'Сведение рук в тренажере (Бабочка)',
						description:
							'Изолирующее упражнение для проработки больших грудных мышц, особенно их внутренней части. Тренажер обеспечивает постоянное напряжение мышц на всей амплитуде движения.',
						image: require('@/assets/training-videos/v8/v1.png'),
						imagePosition: {
							width: '100%',
							left: 0,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v8/v1.png'),
							require('@/assets/training-videos/v8/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_8.mp4',
						primaryMuscles: ['Середина груди'],
						secondaryMuscles: ['Передние дельты'],
						primaryFrontMuscles: ['rightPectoralisMinor', 'leftPectoralisMinor'],
						secondaryFrontMuscles: ['leftFrontDeltoid', 'rightFrontDeltoid', 'rightPectoralisMajor', 'leftPectoralisMajor', 'rightSerratusAnterior', 'leftSerratusAnterior'],
						primaryBackMuscles: [],
						secondaryBackMuscles: [
						],
						tips: [
							'Отрегулируйте высоту сиденья так, чтобы кисти и локти находились на уровне середины груди',
							'Плотно прижмите спину и затылок к спинке тренажера',
							'Сводите руки плавно, делая акцент на сокращении грудных мышц в центральной точке',
							'Не разводите руки слишком сильно назад, чтобы не травмировать плечевые суставы',
							'Держите локти слегка согнутыми и не «выключайте» их до конца',
						],
						equipment: ['Тренажер «Бабочка»'],
						difficulty: 'Новичок',
					},
					{
						id: 'lever-incline-chest-press',
						name: 'Жим в рычажном тренажере под углом',
						description:
							'Упражнение в хаммере для акцентированной проработки верхней части грудных мышц. Фиксированная траектория обеспечивает безопасность суставов и позволяет сфокусироваться на растяжении и сокращении мышц.',
						image: require('@/assets/training-videos/v21/v1.png'),
						imagePosition: {
							width: '140%',
							left: -15,
							scaleX: -1
						},
						images: [
							require('@/assets/training-videos/v21/v1.png'),
							require('@/assets/training-videos/v21/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_21.mp4',
						primaryMuscles: ['Низ груди', 'Середина груди'],
						secondaryMuscles: ['Передние дельты', 'Трицепс', 'Верх груди',],
						primaryFrontMuscles: ['rightPectoralisMinor',
							'rightSerratusAnterior', 'leftSerratusAnterior', 'leftPectoralisMinor'],

						secondaryFrontMuscles: ['leftFrontDeltoid', 'rightFrontDeltoid', 'rightPectoralisMajor', 'leftPectoralisMajor'],

						primaryBackMuscles: [],

						secondaryBackMuscles: [
							'leftTriceps',
							'rightTriceps',
						],
						tips: [
							'Настройте высоту сиденья так, чтобы рукоятки находились на уровне верхней части груди',
							'Плотно прижмите лопатки и таз к спинке тренажера на протяжении всего подхода',
							'Плавно опускайте рукоятки до глубокого растяжения в мышцах груди',
							'На выдохе мощно выжимайте вес вверх, не выпрямляя локти до конца («не вставляйте» сустав)',
							'Держите локти слегка опущенными, не задирайте их слишком высоко к ушам',
						],
						equipment: ['Рычажный тренажер'],
						difficulty: 'Новичок',
					},
					{
						id: 'lever-chest-press',
						name: 'Жим в рычажном тренажере сидя',
						description:
							'Базовое упражнение в тренажере для развития среднего и нижнего отделов грудных мышц. Конструкция хаммера позволяет безопасно работать с большим весом, минимизируя нагрузку на мышцы-стабилизаторы.',
						image: require('@/assets/training-videos/v22/v1.png'),
						imagePosition: {
							width: '140%',
							left: -10,
							scaleX: -1
						},
						images: [
							require('@/assets/training-videos/v22/v1.png'),
							require('@/assets/training-videos/v22/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_22.mp4',
						primaryMuscles: ['Верх груди', 'Середина груди'],
						secondaryMuscles: ['Передние дельты', 'Трицепс'],
						primaryFrontMuscles: ['rightPectoralisMinor',
							'leftPectoralisMinor', 'rightPectoralisMajor', 'leftPectoralisMajor'],
						secondaryFrontMuscles: [
							'rightSerratusAnterior', 'leftSerratusAnterior'
							, 'leftFrontDeltoid', 'rightFrontDeltoid'],
						primaryBackMuscles: [],
						secondaryBackMuscles: ['leftTriceps', 'rightTriceps'],
						tips: [
							'Настройте сиденье так, чтобы рукоятки находились на уровне середины груди',
							'Плотно прижмите спину к спинке, сохраняя естественный прогиб в пояснице',
							'На выдохе выжимайте рукоятки вперед, фокусируясь на сведении локтей друг к другу',
							'В конечной точке не распрямляйте локти полностью, сохраняя напряжение в груди',
							'Опускайте вес плавно до комфортного растяжения, не допуская удара плиток или рывков',
						],
						equipment: ['Рычажный тренажер'],
						difficulty: 'Новичок',
					},
					{
						id: 'lever-incline-chest-press-v2',
						name: 'Жим в рычажном тренажере под углом (вверх)',
						description:
							'Упражнение для акцентированной проработки верхней части грудных мышц и передних дельт. Наклонная конструкция тренажера минимизирует нагрузку на поясницу, позволяя изолированно работать над объемом верха груди.',
						image: require('@/assets/training-videos/v23/v1.png'),
						imagePosition: {
							width: '140%',
							left: -15,
							scaleX: -1
						},
						images: [
							require('@/assets/training-videos/v23/v1.png'),
							require('@/assets/training-videos/v23/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_23.mp4',
						primaryMuscles: ['Верх груди', 'Середина груди'],
						secondaryMuscles: ['Передние дельты', 'Трицепс', 'Низ груди'],
						primaryFrontMuscles: [
							'rightPectoralisMajor', 'leftPectoralisMajor',
							'rightPectoralisMinor', 'leftPectoralisMinor',
						],
						secondaryFrontMuscles: ['leftFrontDeltoid', 'rightFrontDeltoid',
							'rightSerratusAnterior', 'leftSerratusAnterior'
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: ['leftTriceps', 'rightTriceps'],
						tips: [
							'Установите высоту сиденья так, чтобы рукоятки в исходной точке находились чуть ниже уровня плеч',
							'Плотно прижмите лопатки к спинке и не отрывайте их во время жима',
							'Выжимайте рукоятки вверх по дуге, полностью концентрируясь на сокращении верхних отделов груди',
							'Контролируйте фазу опускания, не позволяя весу резко падать вниз',
							'Держите стопы широко и плотно прижатыми к полу для создания устойчивой опоры',
						],
						equipment: ['Рычажный тренажер'],
						difficulty: 'Новичок',
					},
					{
						id: 'incline-dumbbell-press',
						name: 'Жим гантелей на наклонной скамье',
						description:
							'Лучшее упражнение для симметрии и глубокого растяжения верха груди. Гантели позволяют больше амплитуды и лучше прорабатывают каждую сторону отдельно.',
						image: require('@/assets/training-videos/v65/v1.png'),
						imagePosition: {
							width: '140%',
							left: -10,
							scaleX: -1
						},
						images: [
							require('@/assets/training-videos/v65/v1.png'),
							require('@/assets/training-videos/v65/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_65.mp4', // популярный ролик, можешь заменить
						primaryMuscles: ['Верх груди'],
						secondaryMuscles: ['Передние дельты', 'Трицепс', 'Низ груди', 'Середина груди'],
						primaryFrontMuscles: [
							'rightPectoralisMajor', 'leftPectoralisMajor',
						],
						secondaryFrontMuscles: ['leftFrontDeltoid', 'rightFrontDeltoid',
							'rightSerratusAnterior', 'leftSerratusAnterior',
							'rightPectoralisMinor', 'leftPectoralisMinor',

						],
						primaryBackMuscles: [],
						secondaryBackMuscles: ['leftTriceps', 'rightTriceps'],
						tips: [
							'Угол 30–45 градусов',
							'В нижней точке — максимальное растяжение (гантели чуть ниже плеч)',
							'В верхней точке не стучите гантелями — держите напряжение',
							'Движение по дуге, сводите гантели вместе вверху',
							'Контролируйте негативную фазу 2–3 секунды',
						],
						equipment: ['Гантели', 'Наклонная скамья'],
						difficulty: 'Средний',
					},
					{
						id: 'dumbbell-bench-press',
						name: 'Жим гантелей на горизонтальной скамье',
						description:
							'Базовое упражнение для развития грудных мышц. Работа с гантелями обеспечивает большую амплитуду движения в нижней точке и требует значительных усилий от мышц-стабилизаторов для поддержания баланса.',
						image: require('@/assets/training-videos/v66/v1.png'),
						imagePosition: {
							width: '140%',
							left: -10,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v66/v1.png'),
							require('@/assets/training-videos/v66/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_66.mp4',
						primaryMuscles: ['Середина груди'],
						secondaryMuscles: ['Передние дельты', 'Трицепс', 'Верх груди', 'Низ груди'],
						primaryFrontMuscles: [
							'rightPectoralisMinor', 'leftPectoralisMinor',
						],
						secondaryFrontMuscles: ['leftFrontDeltoid', 'rightFrontDeltoid',
							'rightSerratusAnterior', 'leftSerratusAnterior',
							'rightPectoralisMajor', 'leftPectoralisMajor',
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: ['leftTriceps', 'rightTriceps'],
						tips: [
							'Начинайте движение с гантелями на уровне середины груди',
							'Опускайте гантели подконтрольно, чувствуя растяжение грудных мышц',
							'В верхней точке сводите гантели друг к другу, но не ударяйте их',
							'Держите локти под углом примерно 45-60 градусов к корпусу (не разводите их строго в стороны)',
							'Плотно упирайтесь стопами в пол и держите лопатки сведенными на скамье',
						],
						equipment: ['Гантели', 'Горизонтальная скамья'],
						difficulty: 'Средний',
					},
					{
						id: 'dumbbell-flys',
						name: 'Разведение гантелей лежа',
						description:
							'Изолирующее упражнение для грудных мышц, направленное на их растяжение и проработку внутренней части. Позволяет сфокусироваться исключительно на работе больших грудных мышц без участия трицепса.',
						image: require('@/assets/training-videos/v67/v1.png'),
						imagePosition: {
							width: '140%',
							left: -10,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v67/v1.png'),
							require('@/assets/training-videos/v67/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_67.mp4',
						primaryMuscles: ['Середина груди'],
						secondaryMuscles: ['Передние дельты', 'Трицепс', 'Верх груди', 'Низ груди'],
						primaryFrontMuscles: [
							'rightPectoralisMinor', 'leftPectoralisMinor',
						],
						secondaryFrontMuscles: ['leftFrontDeltoid', 'rightFrontDeltoid',
							'rightSerratusAnterior', 'leftSerratusAnterior',
							'rightPectoralisMajor', 'leftPectoralisMajor',
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: ['leftTriceps', 'rightTriceps'],
						tips: [
							'Держите локти слегка согнутыми («мягкими») на протяжении всего движения',
							'Опускайте гантели по широкой дуге до уровня груди, чувствуя сильное растяжение',
							'В верхней точке не содаряйте гантели, останавливайте их на небольшом расстоянии друг от друга',
							'Движение должно быть плавным и подконтрольным, без использования инерции',
							'Плотно прижимайте лопатки и таз к скамье, сохраняя устойчивое положение стоп',
						],
						equipment: ['Гантели', 'Горизонтальная скамья'],
						difficulty: 'Средний',
					},
					{
						id: 'high-to-low-cable-fly',  // лучше сменить id для ясности (или оставь, если не хочешь менять)
						name: 'Сведения в кроссовере сверху вниз',
						description:
							'Изолирующее упражнение для нижней и средней части грудных мышц. Траектория сверху вниз идеально следует ходу волокон стернальной головки pectoralis major, даёт постоянное натяжение и сильное сокращение внизу.',
						image: require('@/assets/training-videos/v41/v2.png'),
						imagePosition: {
							width: '140%',
							left: -10,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v41/v1.png'),
							require('@/assets/training-videos/v41/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_41.mp4',  // проверь, чтобы видео было именно high-to-low (сверху вниз)

						primaryMuscles: ['Низ груди', 'Середина груди'],
						secondaryMuscles: ['Передние дельты'],  // трицепс здесь минимален, можно убрать или оставить как tertiary

						primaryFrontMuscles: [

							'leftSerratusAnterior',
							'rightSerratusAnterior',
							'leftPectoralisMinor',
							'rightPectoralisMinor',
						],

						secondaryFrontMuscles: [
							'leftFrontDeltoid',
							'rightFrontDeltoid',

							'leftPectoralisMajor',
							'rightPectoralisMajor',

						],

						primaryBackMuscles: [],

						secondaryBackMuscles: [],  // трицепс почти не работает (нет разгибания локтя), поэтому пусто

						tips: [
							'Блоки в верхнем положении (high pulleys)',
							'Руки идут вниз и вперёд по дуге, сводятся на уровне живота/ниже груди',
							'В нижней точке — сильное сжатие груди 1–2 секунды, не расслабляйте',
							'Лёгкий наклон корпуса вперёд для лучшего растяжения',
							'Движение только в плечевом суставе, локти слегка согнуты, не раскачивайтесь',
						],
						equipment: ['Кроссовер'],
						difficulty: 'Средний',
					},
					{
						id: 'standing-cable-chest-fly',
						name: 'Сведение рук в кроссовере стоя',
						description:
							'Изолирующее упражнение для детальной проработки больших грудных мышц. Работа в кабельном тренажере обеспечивает постоянное сопротивление по всей траектории движения, что невозможно при работе со свободными весами.',
						image: require('@/assets/training-videos/v42/v2.png'),
						imagePosition: {
							width: '140%',
							left: -10,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v42/v1.png'),
							require('@/assets/training-videos/v42/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_42.mp4',
						primaryMuscles: ['Середина груди'],
						secondaryMuscles: ['Передние дельты', 'Низ груди', 'Верх груди'],
						primaryFrontMuscles: [
							'rightPectoralisMinor', 'leftPectoralisMinor',
						],
						secondaryFrontMuscles: ['leftFrontDeltoid', 'rightFrontDeltoid',
							'rightSerratusAnterior', 'leftSerratusAnterior',
							'rightPectoralisMajor', 'leftPectoralisMajor',
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: [],
						tips: [
							'Сделайте шаг вперед для устойчивости и слегка наклоните корпус (спина прямая)',
							'Держите локти слегка согнутыми и зафиксированными в одном положении на протяжении всего подхода',
							'Сводите руки перед собой, стараясь максимально прожать грудные мышцы в точке касания',
							'Разводите руки до уровня плеч, чувствуя растяжение груди, но не допуская боли в суставах',
							'Двигайтесь плавно, избегайте рывков и не используйте инерцию корпуса',
						],
						equipment: ['Кроссовер'],
						difficulty: 'Средний',
					},
					{
						id: 'low-cable-chest-fly',
						name: 'Сведения в кроссовере с нижних блоков',
						description:
							'Изолирующее упражнение для проработки ключичной (верхней) головки грудных мышц. Траектория движения снизу вверх и внутрь позволяет максимально сократить верх груди.',
						image: require('@/assets/training-videos/v43/v2.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v43/v1.png'),
							require('@/assets/training-videos/v43/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_43.mp4',
						primaryMuscles: ['Верх груди', 'Середина груди'],
						secondaryMuscles: ['Передние дельты', 'Низ груди'],
						primaryFrontMuscles: [
							'rightPectoralisMajor', 'leftPectoralisMajor',
							'rightPectoralisMinor', 'leftPectoralisMinor',
						],
						secondaryFrontMuscles: ['leftFrontDeltoid', 'rightFrontDeltoid',
							'rightSerratusAnterior', 'leftSerratusAnterior'
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: [],
						tips: [
							'Установите блоки в самое нижнее положение',
							'Выведите одну ногу вперед для устойчивости и держите корпус прямо или с легким наклоном назад',
							'Сводите рукоятки перед собой на уровне подбородка или чуть выше',
							'В верхней точке задержитесь на 1 секунду для максимального пикового сокращения',
							'Держите локти слегка согнутыми («мягкими») на протяжении всего движения',
						],
						equipment: ['Кроссовер'],
						difficulty: 'Средний',
					},
				],
			},
			{
				id: 'chest-lower',
				name: 'Низ груди',
				image: manFrontMuscleGroupParts.pectoralisMinor, // или pectoralisMajorLower, если есть такая часть
				exercises: [

				],
			},
			{
				id: 'chest-middle',
				name: 'Середина груди',
				image: manFrontMuscleGroupParts.serratusAnterior,
				exercises: [

				],
			},
		],
	},
	{
		id: 'arms',
		name: 'Руки',
		image: manFrontMuscleGroupParts.armFull,
		position: { left: '-73%', top: '-180%' },
		subgroups: [
			{
				id: 'biceps',
				name: 'Бицепс',
				image: manFrontMuscleGroupParts.bicepsFull,
				exercises: [
					{
						id: 'french-press-lying',
						name: 'Французский жим лёжа',
						description:
							'Изолирующее упражнение на трицепс. Максимально нагружает все три головки трёхглавой мышцы плеча (особенно длинную за счёт сильного растяжения в нижней точке). Минимизирует участие других мышц при правильной технике (фиксированные локти).',
						image: require('@/assets/training-videos/v19/v2.png'),
						imagePosition: {
							width: '120%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v19/v1.png'),
							require('@/assets/training-videos/v19/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_19.mp4',
						primaryMuscles: ['Трицепс'],
						secondaryMuscles: [
							'Предплечья (сгибатели)',
							'Передние дельты',
							'Локтевая мышца (anconeus)',
							'Передняя зубчатая',
							'Мышцы кора (стабилизация)'
						],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: [
							'leftFrontDeltoid',
							'rightFrontDeltoid',
							'rightSerratusAnterior',
							'leftSerratusAnterior',
							'rightExtensorDigitorum',
							'leftExtensorDigitorum',
							'rightExtensorCarpiUharis',
							'leftExtensorCarpiUharis',
							'rightExtensorCarpiRadialis',
							'leftExtensorCarpiRadialis',
						],
						primaryBackMuscles: [
							'leftTriceps',
							'rightTriceps'
						],
						secondaryBackMuscles: [

						],
						tips: [
							'Ляг на скамью, ноги на полу для устойчивости. Возьми EZ-гриф / прямой гриф / гантели.',
							'Фиксируй локти неподвижно (не разводи их в стороны и не опускай к груди).',
							'Опускай снаряд медленно ко лбу или чуть за голову — чувствуй сильное растяжение трицепса.',
							'Полностью разгибай руки в верхней точке, но не блокируй локти жёстко.',
							'Держи плечи прижатыми к скамье, не поднимай их.',
							'Контролируй негативную фазу (опускание) — это ключ к росту длинной головки.',
							'Дыши: вдох при опускании, выдох при разгибании.'
						],
						equipment: ['EZ-гриф', 'Прямая штанга', 'Гантели', 'Скамья'],
						difficulty: 'Средний'
					},
					{
						id: 'bicep-curl-machine',
						name: 'Сгибания рук в тренажере',
						description:
							'Изолирующее упражнение для максимальной проработки бицепса и брахиалиса. Фиксация локтей на подушке исключает раскачку и помощь спиной/плечами, обеспечивая пиковое сокращение бицепса в верхней точке и постоянное напряжение.',
						image: require('@/assets/training-videos/v20/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v20/v1.png'),
							require('@/assets/training-videos/v20/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_20.mp4',
						primaryMuscles: ['Бицепс'],
						secondaryMuscles: ['Брахиалис', 'Плечелучевая мышца', 'Предплечья (сгибатели)'],
						primaryFrontMuscles: [
							'leftLongBiceps',
							'rightLongBiceps',
							'leftShortBiceps',
							'rightShortBiceps',

						],
						secondaryFrontMuscles: [
							'rightExtensorDigitorum',
							'leftExtensorDigitorum',
							'rightExtensorCarpiUharis',
							'leftExtensorCarpiUharis',
							'rightExtensorCarpiRadialis',
							'leftExtensorCarpiRadialis',
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: [

						],
						tips: [
							'Отрегулируй сиденье так, чтобы подмышки плотно прилегали к верхнему краю подушки, а плечи были зафиксированы',
							'Прижми трицепсы и локти к платформе — не отрывай их на протяжении всего подхода',
							'Поднимай вес плавно, акцентируй пиковое сокращение бицепса в верхней точке (задержись на 1 сек)',
							'Не разгибай руки полностью внизу — оставь небольшой угол в локтях, чтобы бицепс не терял напряжение',
							'Держи запястья в нейтральном положении, не заламывай их к себе или от себя',
							'Дыши правильно: выдох на подъёме (сокращение), вдох на опускании',
							'Не используй инерцию — если вес слишком тяжёлый, снизь его для чистой техники'
						],
						equipment: ['Preacher curl machine'],
						difficulty: 'Новичок'
					},
					{
						id: 'cable-tricep-pushdown-ez-bar',
						name: 'Разгибания на трицепс на верхнем блоке (EZ-гриф)',
						description:
							'Изолирующее упражнение для всех трёх головок трицепса (с акцентом на латеральную и медиальную). Постоянное натяжение от блока + удобный изогнутый хват EZ-бара снижают нагрузку на запястья и позволяют лучше изолировать трицепс.',
						image: require('@/assets/training-videos/v25/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v25/v1.png'),
							require('@/assets/training-videos/v25/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_25.mp4',
						primaryMuscles: ['Трицепс'],
						secondaryMuscles: ['Предплечья (сгибатели)', 'Локтевая мышца (anconeus)'],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: [

						],
						primaryBackMuscles: [
							'leftTriceps',
							'rightTriceps'
						],
						secondaryBackMuscles: [
							'leftFlexorDigitorumProfundus',
							'rightFlexorDigitorumProfundus',
							'leftFlexorPollicisLongus',
							'rightFlexorPollicisLongus'
						],
						tips: [
							'Станьте лицом к блоку, возьмите EZ-гриф хватом сверху (ладони вниз), локти плотно прижмите к бокам корпуса и зафиксируйте — они не должны двигаться.',
							'Разгибайте руки полностью в нижней точке, делайте паузу 1 сек и максимально сжимайте трицепс (пиковое сокращение).',
							'Контролируйте негативную фазу (подъём веса) — не позволяйте весу резко тянуть руки вверх.',
							'Не поднимайте вес выше уровня груди/плеч — сохраняйте постоянное натяжение трицепса, не расслабляйте в верхней точке.',
							'Стойте устойчиво: ноги на ширине плеч, лёгкий наклон вперёд, спина ровная, не раскачивайтесь телом.',
							'Двигайте только предплечьями — плечи и локти остаются неподвижными, как шарнир.',
							'Дыши: выдох на разгибании (мощный толчок вниз), вдох на возврате.',
							'Если запястья болят — попробуйте rope или прямой гриф, но EZ обычно комфортнее.'
						],
						equipment: ['Верхний блок', 'EZ-гриф (изогнутая рукоять)'],
						difficulty: 'Новичок'
					},
					{
						id: 'cable-tricep-rope-pushdown',
						name: 'Разгибания на трицепс с канатом',
						description:
							'Изолирующее упражнение для глубокой проработки всех трёх головок трицепса (с акцентом на латеральную и медиальную). Канат позволяет увеличить амплитуду в нижней точке за счёт разведения рукояток, усиливая пиковое сокращение и растяжение мышц.',
						image: require('@/assets/training-videos/v26/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v26/v1.png'),
							require('@/assets/training-videos/v26/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_26.mp4',
						primaryMuscles: ['Трицепс'],
						secondaryMuscles: [
							'Предплечья (сгибатели)',
							'Локтевая мышца (anconeus)'
						],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: [

						],
						primaryBackMuscles: [
							'leftTriceps',
							'rightTriceps'
						],
						secondaryBackMuscles: [
							'leftFlexorDigitorumProfundus',
							'rightFlexorDigitorumProfundus',
							'leftFlexorPollicisLongus',
							'rightFlexorPollicisLongus'
						],
						tips: [
							'Станьте лицом к блоку, возьмите канат нейтральным хватом (ладони внутрь), локти плотно прижмите к корпусу и зафиксируйте — они не должны двигаться вперёд или в стороны.',
							'Разгибайте руки полностью вниз, в нижней точке разведите концы каната в стороны (как бы "выворачивая" кисти наружу) для максимального сокращения латеральной головки трицепса — задержитесь 1 сек.',
							'Контролируйте подъём веса (негатив) — делайте его медленнее (2–3 сек), чтобы сохранить натяжение и избежать рывков.',
							'Не поднимайте вес слишком высоко (выше уровня груди) — сохраняйте постоянное напряжение в трицепсе, не расслабляйте в верхней точке.',
							'Держите корпус неподвижным: лёгкий наклон вперёд, ноги на ширине плеч, спина ровная — избегайте раскачки и помощи плечами/телом.',
							'Двигайте только предплечьями — плечи и локти остаются как шарнир, перпендикулярно полу.',
							'Дыши: выдох на разгибании и разводке (мощное сокращение), вдох на контролируемом возврате.',
							'Если канат скользит — используйте перчатки или магнезию; для новичков начинайте с лёгкого веса, чтобы освоить разводку без потери формы.'
						],
						equipment: ['Верхний блок', 'Канатная рукоять (rope attachment)'],
						difficulty: 'Новичок'
					},
					{
						id: 'barbell-bicep-curl-standing',
						name: 'Подъём штанги на бицепс стоя',
						description:
							'Базовое многосуставное упражнение для развития бицепса (обе головки) и брахиалиса. Свободный вес позволяет задействовать больше стабилизаторов, развивает силу хвата и общую мощь рук, но требует строгой техники, чтобы избежать читинга.',
						image: require('@/assets/training-videos/v27/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v27/v1.png'),
							require('@/assets/training-videos/v27/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_27.mp4',
						primaryMuscles: ['Бицепс'],
						secondaryMuscles: [
							'Брахиалис',
							'Плечелучевая мышца',
							'Предплечья (сгибатели)',
							'Передние дельты'
						],
						primaryFrontMuscles: [
							'leftLongBiceps',
							'rightLongBiceps',
							'leftShortBiceps',
							'rightShortBiceps'
						],
						secondaryFrontMuscles: [

							'leftFrontDeltoid',
							'rightFrontDeltoid'
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: [
							'leftFlexorDigitorumProfundus',
							'rightFlexorDigitorumProfundus',
							'leftFlexorPollicisLongus',
							'rightFlexorPollicisLongus',
						],
						tips: [
							'Станьте прямо, ноги на ширине плеч, спина ровная, лопатки слегка сведены, пресс напряжён — это фиксация корпуса и избежание читинга.',
							'Возьмите штангу хватом на ширине плеч (ладони вверх/supinated), локти плотно прижмите к бокам и зафиксируйте — они не должны двигаться вперёд или в стороны.',
							'Поднимайте штангу плавно до уровня верхней части груди/плеч, максимально сожмите бицепс в верхней точке (пауза 1 сек для пикового сокращения).',
							'Опускайте штангу медленно и подконтрольно (2–3 сек на негатив), не разгибайте руки полностью внизу — сохраняйте напряжение в бицепсе.',
							'Не раскачивайтесь корпусом, не помогайте плечами/спиной — если вес слишком тяжёлый, снизьте его для чистой техники.',
							'Дыши: выдох на подъёме (сокращение), вдох на опускании.',
							'Для равномерной нагрузки на обе головки бицепса используйте средний хват; узкий — больше короткая головка, широкий — длинная.',
							'Если запястья болят — попробуйте EZ-гриф вместо прямой штанги.'
						],
						equipment: ['Штанга (прямая или EZ-гриф)'],
						difficulty: 'Новичок'
					},
					{
						id: 'preacher-curl-barbell',
						name: 'Сгибания рук на скамье Скотта',
						description:
							'Изолирующее упражнение для максимальной проработки бицепса (особенно короткой головки и нижней части) и брахиалиса. Фиксация рук на наклонной скамье полностью исключает читинг, раскачку и помощь плечами/спиной, создавая сильное растяжение и пиковое сокращение для рельефа и пика бицепса.',
						image: require('@/assets/training-videos/v28/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v28/v1.png'),
							require('@/assets/training-videos/v28/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_28.mp4',
						primaryMuscles: ['Бицепс'],
						secondaryMuscles: [
							'Брахиалис',
							'Плечелучевая мышца',
							'Предплечья (сгибатели)',
							'Передние дельты'
						],
						primaryFrontMuscles: [
							'leftLongBiceps',
							'rightLongBiceps',
							'leftShortBiceps',
							'rightShortBiceps'
						],
						secondaryFrontMuscles: [

							'leftFrontDeltoid',
							'rightFrontDeltoid',
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: [
							'leftFlexorDigitorumProfundus',
							'rightFlexorDigitorumProfundus',
							'leftFlexorPollicisLongus',
							'rightFlexorPollicisLongus',
						],  // спина минимально задействована (только стабилизация, без активной нагрузки)
						tips: [
							'Сядьте на скамью Скотта так, чтобы подмышки плотно прилегали к верхнему краю подушки, а грудь опиралась на платформу — это фиксация и полная изоляция.',
							'Возьмите штангу (прямую или EZ) хватом на ширине плеч (ладони вверх), руки полностью выпрямлены, но не блокируйте локти жёстко.',
							'Поднимайте штангу плавно до уровня верхней части груди/плеч, максимально сожмите бицепс в верхней точке (пауза 1 сек) — не доводите до полной вертикали, чтобы не терять напряжение.',
							'Опускайте штангу медленно и контролируемо (2–3 сек на негатив), не выпрямляйте руки полностью внизу — оставьте небольшой изгиб в локтях, чтобы избежать травмы связок и сохранить нагрузку на бицепс.',
							'Держите запястья в нейтральном положении (в одну линию с предплечьями) — не заламывайте их к себе, чтобы нагрузка не уходила в предплечья.',
							'Не отрывайте руки/локти от подушки и не сутультесь — спина ровная, плечи опущены.',
							'Дыши: выдох на подъёме (сокращение), вдох на опускании.',
							'Для акцента на короткую головку — средний/широкий хват; если болят запястья — используйте EZ-гриф.'
						],
						equipment: ['Скамья Скотта', 'Штанга (прямая или EZ-гриф)'],
						difficulty: 'Средний'
					},
					{
						id: 'reverse-barbell-curl-standing',
						name: 'Сгибания рук со штангой обратным хватом',
						description:
							'Изолирующее упражнение для брахиалиса и плечелучевой мышцы (brachioradialis). Обратный (pronated) хват смещает нагрузку с бицепса на внешнюю часть предплечий и нижнюю часть руки, улучшая толщину рук, силу хвата и общую мощь предплечий.',
						image: require('@/assets/training-videos/v29/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v29/v1.png'),
							require('@/assets/training-videos/v29/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_29.mp4',
						primaryMuscles: ['Брахиалис', 'Плечелучевая мышца'],
						secondaryMuscles: ['Предплечья (разгибатели)', 'Бицепс', 'Передние дельты'],
						primaryFrontMuscles: [
							'leftExtensorDigitorum',
							'rightExtensorDigitorum',
							'leftExtensorCarpiUlnaris',
							'rightExtensorCarpiUlnaris',
							'leftExtensorCarpiRadialis',
							'rightExtensorCarpiRadialis',
							'leftFrontDeltoid',
							'rightFrontDeltoid'
						],
						secondaryFrontMuscles: [
							'leftLongBiceps',
							'rightLongBiceps',
							'leftShortBiceps',
							'rightShortBiceps'
						],
						primaryBackMuscles: [

						],
						secondaryBackMuscles: [],
						tips: [
							'Возьмите штангу хватом сверху (ладони вниз/pronated) на ширине плеч или чуть уже — это усиливает акцент на brachioradialis.',
							'Стойте прямо, ноги на ширине плеч, спина ровная, пресс напряжён, локти плотно прижмите к бокам — не раскачивайтесь и не выводите локти вперёд.',
							'Поднимайте штангу плавно до уровня верхней части груди/плеч, максимально напрягите предплечья и брахиалис в верхней точке (пауза 1 сек).',
							'Опускайте вес медленно и контролируемо (2–3 сек на негатив), не позволяйте штанге "падать" — чувствуйте растяжение в разгибателях предплечий.',
							'Если запястья сильно болят или сгибаются — используйте EZ-гриф (изогнутый) или снижайте вес; начинайте с лёгкого веса для освоения техники.',
							'Дыши: выдох на подъёме (сокращение), вдох на опускании.',
							'Не используйте инерцию корпуса — если читинг неизбежен, снизьте вес или перейдите на сидячий вариант на скамье Скотта.',
							'Для большего акцента на предплечья — держите хват жёстче и не давайте запястьям сгибаться вниз.'
						],
						equipment: ['Штанга (прямая или EZ-гриф)'],
						difficulty: 'Средний'
					},
					{
						id: 'alternating-dumbbell-bicep-curl',
						name: 'Поочередные сгибания рук с гантелями',
						description:
							'Изолирующее упражнение для бицепса (обе головки) с сильным акцентом на пиковое сокращение за счёт супинации кисти. Поочередное выполнение позволяет лучше фокусироваться на каждой руке, устраняет дисбаланс и минимизирует читинг, развивая силу хвата и толщину рук за счёт брахиалиса.',
						image: require('@/assets/training-videos/v30/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v30/v1.png'),
							require('@/assets/training-videos/v30/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_30.mp4',
						primaryMuscles: ['Бицепс'],
						secondaryMuscles: [
							'Брахиалис',
							'Плечелучевая мышца',
							'Предплечья (сгибатели)',
							'Передние дельты'
						],
						primaryFrontMuscles: [
							'leftLongBiceps',
							'rightLongBiceps',
							'leftShortBiceps',
							'rightShortBiceps'
						],
						secondaryFrontMuscles: [

							'leftFrontDeltoid',
							'rightFrontDeltoid'
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: [
							'leftFlexorDigitorumProfundus',
							'rightFlexorDigitorumProfundus',
							'leftFlexorPollicisLongus',
							'rightFlexorPollicisLongus',
						],
						tips: [
							'Станьте прямо, ноги на ширине плеч, спина ровная, пресс напряжён, локти прижаты к бокам — не раскачивайтесь корпусом.',
							'Начните с нейтрального хвата (ладони к бедрам), при подъёме гантели разворачивайте кисть наружу (супинация) до положения "ладонь к потолку" — это максимизирует сокращение бицепса.',
							'Поднимайте гантель плавно до уровня плеча/груди, сожмите бицепс в верхней точке (пауза 1 сек), не касайтесь плеча гантелей.',
							'Опускайте медленно и контролируемо (2–3 сек на негатив), полностью разворачивая кисть обратно в нейтральное положение внизу — сохраняйте напряжение.',
							'Чередуйте руки: поднимайте одну, опускайте, затем вторую — или поднимайте одну, держите вверху, пока опускаете другую (для лучшей изоляции).',
							'Не выводите локти вперёд и не используйте инерцию — если вес тяжёлый, снизьте для чистой техники.',
							'Дыши: выдох на подъёме (сокращение + супинация), вдох на опускании.',
							'Для новичков — выполняйте сидя на скамье, чтобы исключить читинг корпусом.'
						],
						equipment: ['Гантели'],
						difficulty: 'Новичок'
					},
					{
						id: 'dumbbell-hammer-curls',
						name: 'Сгибания рук "Молотки"',
						description:
							'Изолирующее упражнение с нейтральным хватом для брахиалиса (под бицепсом) и плечелучевой мышцы (brachioradialis). Помогает увеличить толщину верхней части рук, силу хвата и общую мощь предплечий, создавая сбалансированный и атлетический вид рук (особенно внешняя часть).',
						image: require('@/assets/training-videos/v31/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v31/v1.png'),
							require('@/assets/training-videos/v31/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_31.mp4',
						primaryMuscles: ['Брахиалис', 'Плечелучевая мышца'],
						secondaryMuscles: [
							'Предплечья (разгибатели)',
							'Бицепс',
							'Передние дельты'
						],
						primaryFrontMuscles: [
							'leftFrontDeltoid',
							'rightFrontDeltoid',
							'leftExtensorDigitorum',
							'rightExtensorDigitorum',
							'leftExtensorCarpiUlnaris',
							'rightExtensorCarpiUlnaris',
							'leftExtensorCarpiRadialis',
							'rightExtensorCarpiRadialis'
						],  // стабилизаторы плеч (удерживают позицию рук)
						secondaryFrontMuscles: [
							'leftLongBiceps',
							'rightLongBiceps',
							'leftShortBiceps',
							'rightShortBiceps'
						],  // бицепс как синергист (активация ниже, чем в supinated curl)
						primaryBackMuscles: [

						],  // разгибатели предплечий — основная стабилизация запястья в нейтральном хвате
						secondaryBackMuscles: [],  // нет дополнительной нагрузки на спину или другие задние мышцы
						tips: [
							'Возьмите гантели нейтральным хватом (ладони смотрят друг на друга/к корпусу) на протяжении всего движения — это ключ к акценту на брахиалис и brachioradialis.',
							'Стойте прямо, ноги на ширине плеч, спина ровная, пресс напряжён, локти плотно прижмите к бокам — не раскачивайтесь и не выводите локти вперёд.',
							'Поднимайте гантели одновременно или поочерёдно до уровня плеч/груди, фокусируйтесь на напряжении внешней части руки и предплечий в верхней точке (пауза 1 сек).',
							'Опускайте вес медленно и контролируемо (2–3 сек на негатив), полностью растягивая мышцы в нижней точке — не расслабляйте хват.',
							'Избегайте инерции корпуса — если вес тянет вперёд, снизьте его или выполняйте сидя на скамье для лучшей изоляции.',
							'Дыши: выдох на подъёме (сокращение), вдох на опускании.',
							'Для большего акцента на предплечья — держите хват жёстче и не давайте запястьям сгибаться вниз; если запястья болят — попробуйте лёгкий вес сначала.',
							'Можно делать стоя или сидя; сидячий вариант исключает читинг.'
						],
						equipment: ['Гантели'],
						difficulty: 'Новичок'
					},
					{
						id: 'incline-dumbbell-bicep-curl',
						name: 'Сгибания рук на наклонной скамье',
						description:
							'Изолирующее упражнение с максимальным акцентом на длинную головку бицепса. Наклон спинки (45–60°) создаёт сильное растяжение в нижней точке, увеличивает амплитуду движения и улучшает гипертрофию пика бицепса. Супинация кисти усиливает пиковое сокращение.',
						image: require('@/assets/training-videos/v33/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v33/v1.png'),
							require('@/assets/training-videos/v33/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_33.mp4',
						primaryMuscles: ['Бицепс'],
						secondaryMuscles: [
							'Брахиалис',
							'Плечелучевая мышца',
							'Предплечья (сгибатели)',
							'Передние дельты'
						],
						primaryFrontMuscles: [
							'leftLongBiceps',
							'rightLongBiceps',
							'leftShortBiceps',
							'rightShortBiceps'
						],
						secondaryFrontMuscles: [

							'leftFrontDeltoid',
							'rightFrontDeltoid'
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: [
							'leftFlexorDigitorumProfundus',
							'rightFlexorDigitorumProfundus',
							'leftFlexorPollicisLongus',
							'rightFlexorPollicisLongus',
						],  // стабилизация спины минимальна (спинка скамьи берёт на себя нагрузку), задние предплечья не работают
						tips: [
							'Установите угол спинки скамьи 45–60° (чем больше наклон — тем сильнее растяжение длинной головки, но сложнее техника).',
							'Лягте на скамью, плотно прижмите спину, лопатки и затылок к спинке — не отрывайте их во время всего подхода.',
							'Возьмите гантели нейтральным хватом внизу (ладони к корпусу), при подъёме разворачивайте кисти наружу (супинация) до положения "ладонь к потолку".',
							'Локти строго зафиксированы и направлены вниз/в пол — не выводите их вперёд и не разводите в стороны.',
							'В нижней точке полностью растягивайте бицепс (руки почти прямые, но не блокируйте локти), чувствуйте сильное натяжение в длинной головке.',
							'Поднимайте гантели плавно и контролируемо до уровня плеч, сожмите бицепс в верхней точке (пауза 1 сек), не касайтесь гантелями плеч.',
							'Опускайте медленно (2–3 сек на негатив), полностью контролируя движение — это ключ к росту от растяжения.',
							'Дыши: выдох на подъёме (сокращение + супинация), вдох на опускании.',
							'Избегайте раскачки гантелей и помощи плечами — если вес тяжёлый, снижайте его для чистой формы.',
							'Для новичков начинайте с меньшего угла (30–45°), чтобы освоить технику.'
						],
						equipment: ['Гантели', 'Наклонная скамья (incline bench)'],
						difficulty: 'Средний'
					},
					{
						id: 'single-arm-reverse-grip-tricep-pushdown',
						name: 'Разгибание одной руки обратным хватом',
						description:
							'Одностороннее изолирующее упражнение на трицепс с акцентом на медиальную (внутреннюю) головку за счёт обратного хвата (supinated). Позволяет лучше чувствовать целевую мышцу, устранять дисбаланс между руками и улучшать контроль в нижней точке.',
						image: require('@/assets/training-videos/v38/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v38/v1.png'),
							require('@/assets/training-videos/v38/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_38.mp4',
						primaryMuscles: ['Трицепс'],
						secondaryMuscles: [
							'Предплечья (сгибатели)',
							'Локтевая мышца (anconeus)'
						],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: [

							'leftFrontDeltoid',
							'rightFrontDeltoid'
						],
						primaryBackMuscles: [
							'leftTriceps',
							'rightTriceps'
						],
						secondaryBackMuscles: [
							'leftFlexorDigitorumProfundus',
							'rightFlexorDigitorumProfundus',
							'leftFlexorPollicisLongus',
							'rightFlexorPollicisLongus',
						],  // стабилизация спины минимальна, задние предплечья (extensors) не работают
						tips: [
							'Возьмитесь за прямую или EZ-рукоять хватом снизу (ладонь смотрит вверх/supinated) — это ключевой момент для акцента на медиальную головку трицепса.',
							'Станьте боком или лицом к блоку, прижмите рабочий локоть плотно к корпусу и зафиксируйте — он не должен двигаться вперёд, назад или в сторону.',
							'Разгибайте руку полностью вниз, делайте паузу 1 сек в нижней точке и максимально прожимайте трицепс (пиковое сокращение).',
							'Контролируйте возврат веса (негатив) — медленно (2–3 сек), не позволяйте блоку резко дёргать руку вверх и расслаблять трицепс.',
							'Свободной рукой держитесь за раму или стойку для устойчивости корпуса и лучшей изоляции — не раскачивайтесь телом.',
							'Делайте подход на одну руку полностью, затем на вторую — или чередуйте по повторениям для баланса.',
							'Дыши: выдох на разгибании (мощное сокращение), вдох на контролируемом возврате.',
							'Если запястья болят — начните с лёгкого веса или используйте канат/веревку вместо жёсткой рукояти.',
							'Для максимального акцента на медиальную головку — держите локоть чуть ближе к телу и не разводите его.'
						],
						equipment: ['Верхний блок', 'Прямая рукоять или EZ-рукоять'],
						difficulty: 'Средний'
					},
					{
						id: 'cable-overhead-tricep-extension-rope',
						name: 'Разгибания рук из-за головы на блоке (канат)',
						description:
							'Изолирующее упражнение с максимальным акцентом на длинную головку трицепса. Положение рук overhead обеспечивает сильное растяжение длинной головки (она пересекает плечевой сустав), а канат позволяет увеличить амплитуду и пиковое сокращение за счёт разделения рукояток в верхней точке.',
						image: require('@/assets/training-videos/v39/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v39/v1.png'),
							require('@/assets/training-videos/v39/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_39.mp4',
						primaryMuscles: ['Трицепс'],
						secondaryMuscles: [
							'Предплечья (сгибатели)',
							'Локтевая мышца (anconeus)',
							'Передние дельты',
							'Зубчатые мышцы (serratus anterior)'
						],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: [

							'leftFrontDeltoid',
							'rightFrontDeltoid',
							'rightSerratusAnterior',
							'leftSerratusAnterior'
						],
						primaryBackMuscles: [
							'leftTriceps',
							'rightTriceps'
						],
						secondaryBackMuscles: [
							'leftFlexorDigitorumProfundus',
							'rightFlexorDigitorumProfundus',
							'leftFlexorPollicisLongus',
							'rightFlexorPollicisLongus',
						],
						tips: [
							'Встаньте спиной к блоку (или лицом, если низкий блок), возьмите канат за концы, выведите одну ногу вперёд для устойчивости, слегка наклонитесь вперёд.',
							'Поднимите руки overhead, локти близко к голове/ушам, направлены вверх — не разводите их сильно в стороны и не опускайте ниже уровня плеч.',
							'Разгибайте руки полностью вверх, в верхней точке разделяйте концы каната в стороны (лёгкая пронация) для максимального сокращения длинной головки — задержитесь 1 сек.',
							'Медленно опускайте канат за голову (2–3 сек на негатив), чувствуя сильное растяжение в трицепсе — не расслабляйте внизу.',
							'Держите корпус стабильным: пресс напряжён, не прогибайтесь в пояснице (можно слегка наклониться вперёд, но спина ровная).',
							'Локти фиксированы — движение только в локтевых суставах, как в шарнире; если локти "гуляют" — снизьте вес.',
							'Дыши: выдох на разгибании вверх (мощное сокращение), вдох на опускании за голову.',
							'Для максимального акцента на длинную головку — держите локти как можно выше/ближе к голове; если плечи болят — уменьшите угол или вес.',
							'Если канат скользит — используйте перчатки; для новичков начинайте с двух рук, потом переходите на односторонний вариант.'
						],
						equipment: ['Верхний блок', 'Канатная рукоять (rope attachment)'],
						difficulty: 'Средний'
					},
					{
						id: 'cable-bicep-curl-straight-bar',
						name: 'Сгибания рук на нижнем блоке (прямая рукоять)',
						description:
							'Изолирующее упражнение для бицепса с постоянным натяжением троса на всём диапазоне движения. Это обеспечивает лучшее мышечное напряжение и пампинг по сравнению со свободными весами, особенно акцентируя обе головки бицепса и брахиалис.',
						image: require('@/assets/training-videos/v40/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v40/v1.png'),
							require('@/assets/training-videos/v40/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_40.mp4',
						primaryMuscles: ['Бицепс'],
						secondaryMuscles: [
							'Брахиалис',
							'Плечелучевая мышца',
							'Предплечья (сгибатели)',
							'Передние дельты'
						],
						primaryFrontMuscles: [
							'leftLongBiceps',
							'rightLongBiceps',
							'leftShortBiceps',
							'rightShortBiceps'
						],
						secondaryFrontMuscles: [

							'leftFrontDeltoid',
							'rightFrontDeltoid'
						],
						primaryBackMuscles: [],
						secondaryBackMuscles: [
							'leftFlexorDigitorumProfundus',
							'rightFlexorDigitorumProfundus',
							'leftFlexorPollicisLongus',
							'rightFlexorPollicisLongus',
						],
						tips: [
							'Встаньте лицом к нижнему блоку, возьмитесь за прямую рукоять хватом снизу (supinated, ладони вверх) на ширине плеч, слегка отступите назад для постоянного натяжения троса.',
							'Прижмите локти плотно к бокам корпуса и зафиксируйте — они не должны двигаться вперёд, назад или в стороны (движение только в локтевых суставах).',
							'Тяните рукоять к верхней части груди/плеч плавно и контролируемо, максимально сожмите бицепс в верхней точке (пауза 1 сек для пикового сокращения).',
							'Не отклоняйтесь назад корпусом и не используйте инерцию — если тянет назад, встаньте ближе или снизьте вес.',
							'Опускайте рукоять медленно (2–3 сек на негатив), не позволяйте плитам хлопать — сохраняйте натяжение в бицепсе в нижней точке (не расслабляйте полностью).',
							'Дыши: выдох на подъёме (сокращение), вдох на опускании.',
							'Для большего акцента на короткую головку — хват шире плеч; для длинной — уже; если запястья болят — попробуйте EZ-рукоять.',
							'Держите плечи опущенными и расслабленными — не поднимайте их к ушам, чтобы не включать трапеции.'
						],
						equipment: ['Нижний блок (low pulley)', 'Прямая рукоять (straight bar attachment)'],
						difficulty: 'Новичок'
					},
					{
						id: 'machine-seated-dip',
						name: 'Отжимания на трицепс в тренажере',
						description:
							'Эффективное упражнение для развития силы и объема трицепса. Сидячее положение и фиксированная траектория рычагов позволяют работать с большими весами, максимально нагружая все три головки трицепса.',
						image: require('@/assets/training-videos/v47/v1.png'),
						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},
						images: [
							require('@/assets/training-videos/v47/v1.png'),
							require('@/assets/training-videos/v47/v2.png'),
						],
						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_47.mp4',

						primaryMuscles: ['Трицепс'],
						secondaryMuscles: ['Плечи', 'Грудь'],

						primaryFrontMuscles: [],

						secondaryFrontMuscles: [
							'leftFrontDeltoid',
							'rightFrontDeltoid',
							'leftPectoralisMajor',
							'rightPectoralisMajor'
						],

						primaryBackMuscles: [
							'leftTriceps',
							'rightTriceps'
						],

						secondaryBackMuscles: [],

						tips: [
							'Плотно прижмите спину к спинке тренажера и удерживайте корпус вертикально',
							'Не разводите локти слишком сильно в стороны — держите их ближе к телу для акцента на трицепс',
							'В нижней точке полностью выпрямляйте руки, прожимая трицепс, но не "вставляйте" локти до щелчка',
							'Поднимайте рукояти подконтрольно до уровня, когда предплечья станут параллельны полу, чтобы не перегружать плечевой сустав',
							'Следите, чтобы плечи не поднимались к ушам — держите лопатки опущенными',
						],

						equipment: ['Рычажный тренажер'],
						difficulty: 'Новичок',
					},
					{
						id: 'machine-seated-overhead-tricep-extension',

						name: 'Французский жим в тренажере сидя',

						description:
							'Изолирующее упражнение для проработки длинной головки трицепса. Работа в тренажере обеспечивает стабильность корпуса и позволяет безопасно растягивать мышцы под нагрузкой в нижней точке траектории.',

						image: require('@/assets/training-videos/v69/v1.png'),

						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v69/v1.png'),
							require('@/assets/training-videos/v69/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_69.mp4',

						primaryMuscles: ['Трицепс'],

						secondaryMuscles: [
							'Предплечья'
						],

						primaryFrontMuscles: [],

						secondaryFrontMuscles: [

						],

						primaryBackMuscles: [
							'leftTriceps',
							'rightTriceps'
						],

						secondaryBackMuscles: [
							'leftFlexorDigitorumProfundus',
							'rightFlexorDigitorumProfundus',
							'leftFlexorPollicisLongus',
							'rightFlexorPollicisLongus'
						],

						tips: [
							'Плотно прижмите спину к спинке тренажера, не прогибайтесь в пояснице',
							'Старайтесь держать локти направленными вверх и не разводите их слишком сильно в стороны',
							'Плавно опускайте рукоять за голову до ощущения комфортного растяжения в трицепсах',
							'На выдохе мощно разгибайте руки вверх, полностью сокращая трицепс в верхней точке',
							'Избегайте резких движений — тренажер требует плавного и подконтрольного темпа',
						],

						equipment: ['Рычажный тренажер'],

						difficulty: 'Новичок',
					}
				],
			},
			{
				id: 'triceps',
				name: 'Трицепс',
				image: manBackMuscleGroupParts.triceps,
				exercises: [
				],
			},
			{
				id: 'forearms',
				name: 'Предплечья',
				image: manFrontMuscleGroupParts.forearmFull,
				exercises: [
				],
			},
		],
	},
	{
		id: 'deltoids',
		name: 'Дельты',
		image: manFrontMuscleGroupParts.deltoidsFull,
		position: { left: '-63%', top: '-160%' },
		subgroups: [
			{
				id: 'deltoids-front',
				name: 'Передние дельты',
				image: manFrontMuscleGroupParts.frontDeltoid || manFrontMuscleGroupParts.deltoidsFull,
				exercises: [
					{
						id: 'rear-delt-fly-machine',

						name: 'Обратные разведения в тренажере (Reverse Fly)',

						description:
							'Изолирующее упражнение для проработки заднего пучка дельтовидных мышц. Помогает улучшить осанку и создать завершенную шаровидную форму плеч, минимизируя нагрузку на мышцы спины при правильной технике.',

						image: require('@/assets/training-videos/v9/v1.png'),

						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v9/v1.png'),
							require('@/assets/training-videos/v9/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_9.mp4',

						primaryMuscles: ['Плечи'],

						secondaryMuscles: [
							'Трапеции',
							'Спина'
						],

						primaryFrontMuscles: [],

						secondaryFrontMuscles: [],

						primaryBackMuscles: [
							'leftRearDeltoid',
							'rightRearDeltoid'
						],

						secondaryBackMuscles: [
							'leftUpperTrapezius',
							'rightUpperTrapezius',
							'leftIntraspinatus',
							'rightIntraspinatus'
						],

						tips: [
							'Отрегулируйте высоту сиденья так, чтобы руки были параллельны полу',
							'Держите локти слегка согнутыми и направленными в стороны, не "выключайте" их',
							'Отводите руки назад до уровня плеч, фокусируясь на работе задних дельт',
							'Не позволяйте весу полностью опускаться в исходной точке, чтобы сохранять напряжение',
							'Старайтесь не помогать себе корпусом, плотно прижмитесь грудью к спинке тренажера',
						],

						equipment: ['Тренажер Peck-Deck'],

						difficulty: 'Новичок',
					},
					{
						id: 'lever-shoulder-press',

						name: 'Жим на плечи в рычажном тренажере',

						description:
							'Базовое упражнение для развития плечевого пояса. Тренажер обеспечивает стабильную траекторию, что позволяет безопасно работать с большими весами и максимально нагружать передние и средние дельты.',

						image: require('@/assets/training-videos/v24/v1.png'),

						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v24/v1.png'),
							require('@/assets/training-videos/v24/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_24.mp4',

						primaryMuscles: ['Плечи'],

						secondaryMuscles: [
							'Трицепс',
							'Трапеции'
						],

						primaryFrontMuscles: [
							'leftFrontDeltoid',
							'rightFrontDeltoid',
							'leftMiddleDeltoid',
							'rightMiddleDeltoid'
						],

						secondaryFrontMuscles: [
							'leftTriceps',
							'rightTriceps'
						],

						primaryBackMuscles: [],

						secondaryBackMuscles: [
							'leftUpperTrapezius',
							'rightUpperTrapezius'
						],

						tips: [
							'Отрегулируйте высоту сиденья так, чтобы рукоятки в нижней точке находились на уровне или чуть выше плеч',
							'Плотно прижмите спину и затылок к спинке тренажера, не прогибайтесь сильно в пояснице',
							'Выжимайте рукоятки вверх на выдохе, не выпрямляя локти до "щелчка" в верхней точке',
							'Контролируйте движение при опускании веса, не бросайте его резко вниз',
							'Держите локти слегка направленными вперед, а не строго в стороны, чтобы снизить нагрузку на суставы',
						],

						equipment: ['Рычажный тренажер'],

						difficulty: 'Новичок',
					},
					{
						id: 'seated-dumbbell-shoulder-press',

						name: 'Жим гантелей сидя',

						description:
							'Базовое упражнение для проработки дельтовидных мышц. Позволяет работать по большой амплитуде и обеспечивает независимую нагрузку на каждое плечо, что помогает исправить мышечный дисбаланс.',

						image: require('@/assets/training-videos/v32/v1.png'),

						imagePosition: {
							width: '140%',
							left: -10,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v32/v1.png'),
							require('@/assets/training-videos/v32/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_32.mp4',

						primaryMuscles: ['Плечи'],

						secondaryMuscles: [
							'Трицепс',
							'Трапеции'
						],

						primaryFrontMuscles: [
							'leftFrontDeltoid',
							'rightFrontDeltoid',
							'leftMiddleDeltoid',
							'rightMiddleDeltoid'
						],

						secondaryFrontMuscles: [
							'leftTriceps',
							'rightTriceps'
						],

						primaryBackMuscles: [],

						secondaryBackMuscles: [
							'leftUpperTrapezius',
							'rightUpperTrapezius'
						],

						tips: [
							'Установите спинку скамьи под углом 80-90 градусов для надежной опоры',
							'Держите гантели на уровне ушей в начальной точке, локти направлены слегка вперед, а не строго в стороны',
							'На выдохе мощно выжимайте гантели вверх, не допуская их соударения в верхней точке',
							'Не выпрямляйте локти полностью вверху, чтобы сохранить напряжение в дельтах',
							'Опускайте гантели подконтрольно, чувствуя растяжение плечевых мышц',
						],

						equipment: [
							'Гантели',
							'Скамья со спинкой'
						],

						difficulty: 'Средний',
					},
					{
						id: 'dumbbell-lateral-raise-standing',

						name: 'Разводка гантелей в стороны',

						description:
							'Изолирующее упражнение для акцентированной проработки средней дельты. Позволяет создать ширину плечевого пояса и улучшить мышечный рельеф рук.',

						image: require('@/assets/training-videos/v34/v2.png'),

						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v34/v1.png'),
							require('@/assets/training-videos/v34/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_34.mp4',

						primaryMuscles: ['Плечи'],

						secondaryMuscles: [
							'Трапеции'
						],

						primaryFrontMuscles: [
							'leftMiddleDeltoid',
							'rightMiddleDeltoid'
						],

						secondaryFrontMuscles: [
							'leftFrontDeltoid',
							'rightFrontDeltoid'
						],

						primaryBackMuscles: [],

						secondaryBackMuscles: [
							'leftUpperTrapezius',
							'rightUpperTrapezius'
						],

						tips: [
							'Поднимайте гантели до уровня плеч, не выше, чтобы не перегружать трапецию',
							'Держите локти слегка согнутыми и ведите их вверх — локоть всегда должен быть чуть выше кисти',
							'Не используйте инерцию (читтинг), корпус должен оставаться неподвижным',
							'В верхней точке мизинец должен быть слегка выше большого пальца (представьте, что выливаете воду из кувшинов)',
							'Опускайте гантели медленно, сопротивляясь весу, не позволяя им просто падать вниз',
						],

						equipment: [
							'Гантели'
						],

						difficulty: 'Средний',
					},
					{
						id: 'dumbbell-front-raise-standing',

						name: 'Подъем гантелей перед собой',

						description:
							'Изолирующее упражнение, направленное на детальную проработку переднего пучка дельтовидных мышц. Оно помогает четко очертить переднюю линию плеча и улучшить его рельеф.',

						image: require('@/assets/training-videos/v35/v2.png'),

						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v35/v1.png'),
							require('@/assets/training-videos/v35/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_35.mp4',

						primaryMuscles: ['Плечи'],

						secondaryMuscles: [
							'Грудь',
							'Трапеции'
						],

						primaryFrontMuscles: [
							'leftFrontDeltoid',
							'rightFrontDeltoid'
						],

						secondaryFrontMuscles: [
							'leftMiddleDeltoid',
							'rightMiddleDeltoid',
							'leftPectoralisMajor',
							'rightPectoralisMajor'
						],

						primaryBackMuscles: [],

						secondaryBackMuscles: [
							'leftUpperTrapezius',
							'rightUpperTrapezius'
						],

						tips: [
							'Поднимайте гантели до уровня глаз или чуть выше, сохраняя контроль в верхней точке',
							'Не раскачивайте корпус — если приходится помогать себе телом, значит вес слишком тяжелый',
							'Держите локти слегка согнутыми на протяжении всего движения',
							'Опускайте гантели плавно и подконтрольно, не позволяя им просто падать вниз под своим весом',
							'Старайтесь держать грудь расправленной и не сводить плечи вперед',
						],

						equipment: [
							'Гантели'
						],

						difficulty: 'Новичок',
					},
					{
						id: 'seated-bent-over-dumbbell-reverse-fly',

						name: 'Разведение гантелей в наклоне сидя',

						description:
							'Изолирующее упражнение для заднего пучка дельтовидных мышц. Выполнение сидя минимизирует читтинг (раскачку корпусом) и позволяет максимально сфокусироваться на целевой мышце.',

						image: require('@/assets/training-videos/v36/v1.png'),

						imagePosition: {
							width: '140%',
							left: -10,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v36/v1.png'),
							require('@/assets/training-videos/v36/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_36.mp4',

						primaryMuscles: ['Задняя дельта'],

						secondaryMuscles: ['Ромбовидные', 'Средняя трапеция', 'Малая круглая мышца'],

						primaryFrontMuscles: [],

						secondaryFrontMuscles: [],

						primaryBackMuscles: [
							'leftRearDeltoid',
							'rightRearDeltoid'
						],

						secondaryBackMuscles: [
							'leftMiddleTrapezius',
							'rightMiddleTrapezius'
						],

						tips: [
							'Наклонитесь вперед так, чтобы грудь почти касалась коленей, спину держите ровной',
							'Разводите гантели в стороны через локти, стараясь не сводить лопатки слишком сильно в верхней точке',
							'Держите мизинцы чуть выше больших пальцев во время подъема для лучшей изоляции задней дельты',
							'Не поднимайте голову вверх, взгляд должен быть направлен в пол перед собой, чтобы не перенапрягать шею',
							'Двигайтесь плавно, без рывков, и делайте небольшую паузу в верхней точке сокращения',
						],

						equipment: ['Гантели', 'Горизонтальная скамья'],

						difficulty: 'Средний',
					},
					{
						id: 'cable-face-pull',

						name: 'Лицевая тяга на верхнем блоке',

						description:
							'Упражнение для укрепления задней дельты, ротаторной манжеты плеча и мышц верха спины. Помогает исправить "округлые плечи" и улучшить стабильность плечевого сустава.',

						image: require('@/assets/training-videos/v37/v2.png'),

						imagePosition: {
							width: '140%',
							left: -30,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v37/v1.png'),
							require('@/assets/training-videos/v37/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_37.mp4',

						primaryMuscles: ['Задняя дельта'],

						secondaryMuscles: ['Средняя трапеция', 'Ромбовидные', 'Подостная мышца'],

						primaryFrontMuscles: [],

						secondaryFrontMuscles: [],

						primaryBackMuscles: [
							'leftRearDeltoid',
							'rightRearDeltoid'
						],

						secondaryBackMuscles: [
							'leftMiddleTrapezius',
							'rightMiddleTrapezius'
						],

						tips: [
							'Возьмитесь за концы каната так, чтобы большие пальцы были направлены к вам',
							'Тяните канат к лицу (к уровню лба или носа), разводя концы каната в стороны',
							'В конечной точке локти должны быть направлены в стороны, а кисти находиться выше локтей (внешняя ротация)',
							'Сжимайте лопатки в пиковой точке и задержитесь на 1 секунду',
							'Контролируйте движение при возврате, не позволяя блоку резко тянуть ваши руки вперед',
						],

						equipment: ['Блочная рама'],

						difficulty: 'Средний',
					},
					{
						id: 'lateral-raise-machine',

						name: 'Разведения в тренажере на среднюю дельту',

						description:
							'Изолирующее упражнение для акцентированной проработки среднего пучка дельтовидных мышц. Использование тренажера минимизирует участие трапециевидных мышц и позволяет лучше контролировать технику.',

						image: require('@/assets/training-videos/v68/v2.png'),

						imagePosition: {
							width: '140%',
							left: -10,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v68/v1.png'),
							require('@/assets/training-videos/v68/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_68.mp4',

						primaryMuscles: ['Средняя дельта'],

						secondaryMuscles: ['Передняя дельта', 'Трапециевидные мышцы'],

						primaryFrontMuscles: [
							'leftMiddleDeltoid',
							'rightMiddleDeltoid'
						],

						secondaryFrontMuscles: [
							'leftFrontDeltoid',
							'rightFrontDeltoid'
						],

						primaryBackMuscles: [],

						secondaryBackMuscles: [
							'leftMiddleTrapezius',
							'rightMiddleTrapezius'
						],

						tips: [
							'Отрегулируйте высоту сиденья так, чтобы оси вращения тренажера совпадали с вашими плечевыми суставами',
							'Плотно прижмитесь спиной к спинке и держите грудь расправленной',
							'Упирайтесь локтями (а не кистями) в подушки тренажера для лучшей изоляции дельт',
							'Поднимайте рычаги до уровня плеч и делайте небольшую паузу в верхней точке',
							'Опускайте вес медленно, не позволяя плитам тренажера соприкасаться, чтобы сохранять нагрузку',
						],

						equipment: ['Разведение в стороны'],

						difficulty: 'Новичок',
					}
				],
			},
			{
				id: 'deltoids-lateral',
				name: 'Средние дельты',
				image: manFrontMuscleGroupParts.middleDeltoid || manFrontMuscleGroupParts.deltoidsFull,
				exercises: [

				],
			},
			{
				id: 'deltoids-rear',
				name: 'Задние дельты',
				image: manBackMuscleGroupParts.deltoidFull || manFrontMuscleGroupParts.deltoidsFull,
				exercises: [

				],
			},
		],
	},
	{
		id: 'press',
		name: 'Пресс',
		image: manFrontMuscleGroupParts.pressFull,
		position: { left: '-103%', top: '-210%' },
		subgroups: [
			{
				id: 'press-upper',
				name: 'Верхний пресс',
				image: manFrontMuscleGroupParts.upperFullAbs || manFrontMuscleGroupParts.pressFull,
				exercises: [
					{
						id: 'decline-bench-sit-ups',

						name: 'Скручивания на наклонной скамье',

						description:
							'Эффективное упражнение для укрепления прямой мышцы живота. Угол наклона скамьи позволяет увеличить нагрузку на мышцы пресса и задействовать их по всей длине.',

						image: require('@/assets/training-videos/v58/v2.png'),

						imagePosition: {
							width: '140%',
							left: -30,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v58/v1.png'),
							require('@/assets/training-videos/v58/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_58.mp4',

						primaryMuscles: ['Пресс'],

						secondaryMuscles: ['Подвздошно-поясничная мышца'],

						primaryFrontMuscles: [
							'upperAbs',
							'upperMiddleAbs'
						],

						secondaryFrontMuscles: [
							'leftExternalOblique',
							'rightExternalOblique',
							'leftInternalOblique',
							'rightInternalOblique'
						],

						primaryBackMuscles: [],

						secondaryBackMuscles: [],

						tips: [
							'Настройте угол наклона скамьи: чем ниже голова, тем сложнее выполнять упражнение',
							'Не тяните себя руками за голову — держите их скрещенными на груди или у висков, чтобы не перегружать шею',
							'Поднимайтесь за счет скручивания корпуса, а не простого подъема прямой спины',
							'В верхней точке максимально напрягите пресс, а на спуске двигайтесь медленно и подконтрольно',
							'Не опускайте лопатки на скамью полностью в нижней точке, чтобы сохранять постоянное напряжение в мышцах',
						],

						equipment: ['Наклонная скамья для пресса'],

						difficulty: 'Новичок',
					},
					{
						id: 'seated-machine-crunch',

						name: 'Скручивания в тренажере',

						description:
							'Изолирующее упражнение для глубокой проработки прямой мышцы живота. Конструкция тренажера позволяет выполнять движение с дополнительным отягощением, обеспечивая постоянное напряжение мышц пресса на всей амплитуде.',

						image: require('@/assets/training-videos/v59/v1.png'),

						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v59/v1.png'),
							require('@/assets/training-videos/v59/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_59.mp4',

						primaryMuscles: ['Пресс'],

						secondaryMuscles: ['Косые мышцы живота'],

						primaryFrontMuscles: [
							'upperAbs',
							'upperMiddleAbs'
						],

						secondaryFrontMuscles: [
							'leftExternalOblique',
							'rightExternalOblique',
							'leftInternalOblique',
							'rightInternalOblique'
						],

						primaryBackMuscles: [],

						secondaryBackMuscles: [],

						tips: [
							'Отрегулируйте высоту сиденья так, чтобы ось вращения тренажера совпадала с линией вашего пояса',
							'Делайте движение за счет сокращения мышц пресса, а не за счет силы рук, тянущих за рукояти',
							'На выдохе максимально скрутите корпус вниз, стараясь приблизить грудную клетку к тазу',
							'В нижней точке задержитесь на 1 секунду для пикового сокращения мышц',
							'Возвращайтесь в исходное положение медленно, не позволяя плиткам весового стека полностью соприкасаться',
						],

						equipment: ['Тренажер для пресса'],

						difficulty: 'Новичок',
					},
					{
						id: 'captains-chair-leg-raise',

						name: 'Подъем ног в упоре на брусьях',

						description:
							'Базовое упражнение для акцентированной проработки нижнего отдела пресса. Упор на предплечья фиксирует корпус, позволяя максимально изолировать целевые мышцы и исключить помощь инерции.',

						image: require('@/assets/training-videos/v62/v2.png'),

						imagePosition: {
							width: '140%',
							left: -20,
							scaleX: 1
						},

						images: [
							require('@/assets/training-videos/v62/v1.png'),
							require('@/assets/training-videos/v62/v2.png'),
						],

						videoUrl: 'https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_62.mp4',

						primaryMuscles: ['Пресс'],

						secondaryMuscles: ['Подвздошно-поясничная мышца', 'Передняя дельта'],

						primaryFrontMuscles: ['lowerAbs', 'lowerMiddleAbs'],

						secondaryFrontMuscles: [
							'leftExternalOblique',
							'rightExternalOblique',
							'leftInternalOblique',
							'rightInternalOblique',
							'leftFrontDeltoid',
							'rightFrontDeltoid'
						],

						primaryBackMuscles: [],

						secondaryBackMuscles: [],

						tips: [
							'Плотно прижмите поясницу к подушке тренажера и не отрывайте её во время подъема',
							'Не раскачивайте ноги — движение должно быть плавным и подконтрольным',
							'Старайтесь поднимать ноги чуть выше параллели с полом, слегка подкручивая таз вперед для максимального сокращения пресса',
							'На выдохе поднимайте ноги, на вдохе медленно опускайте',
							'Если поднимать прямые ноги слишком тяжело, начните с подъема коленей к груди',
						],

						equipment: ['Тренажер "Брусья-пресс"'],

						difficulty: 'Средний',
					}
				],
			},
			{
				id: 'press-lower',
				name: 'Нижний пресс',
				image: manFrontMuscleGroupParts.lowerFullAbs || manFrontMuscleGroupParts.pressFull,
				exercises: [

				],
			},
			{
				id: 'press-obliques',
				name: 'Косыidе мышцы',
				image: manFrontMuscleGroupParts.obliqueFullAbs || manFrontMuscleGroupParts.pressFull,
				exercises: [

				],
			},
			{
				id: 'press-deep-core',
				name: 'Глубокий кор',
				image: manFrontMuscleGroupParts.pressFull || manFrontMuscleGroupParts.pressFull,
				exercises: [

				],
			},
		],
	},
	{
		id: "legs",
		name: "Ноги",
		image: "manFrontMuscleGroupParts.upperLegFull",
		position: { left: "-103%", "top": "-270%" },
		subgroups: [
			{
				id: "vastus-lateralis",
				name: "Латеральная широкая мышца бедра",
				image: "manFrontMuscleGroupParts.vastusLateralis",
				exercises: [
					{
						id: "lying-leg-curls",
						name: "Сгибания ног лежа",
						"description": "Изолирующее упражнение для проработки мышц задней поверхности бедра (бицепса бедра). Работа в тренажере позволяет поддерживать постоянное напряжение и безопасно нагружать мышцы под разными углами.",
						image: require('@/assets/training-videos/v4/v1.png'),
						imagePosition: { width: "140%", left: -10, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v4/v1.png'),
							require('@/assets/training-videos/v4/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_4.mp4",
						primaryMuscles: ["Бицепс бедра"],
						secondaryMuscles: ["Икроножные мышцы"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": ["leftBiceosFemoris", "rightBiceosFemoris", "leftSemitendinosus", "rightSemitendinosus"],
						secondaryBackMuscles: ["leftGastrocnemius", "rightGastrocnemius"],
						tips: [
							"Отрегулируйте валик так, чтобы он упирался в нижнюю часть голени, чуть выше ахиллова сухожилия",
							"Колени должны находиться на одной линии с осью вращения тренажера",
							"Плотно прижимайте таз к скамье во время выполнения, чтобы исключить нагрузку на поясницу",
							"Выполняйте сгибание мощно, а разгибание — медленно и подконтрольно",
							"Не разгибайте ноги до самого конца, сохраняя легкое напряжение в мышцах в нижней точке"
						],
						equipment: ["Тренажер для сгибания ног"],
						difficulty: "Новичок"
					},
					{
						id: "seated-leg-extensions",
						name: "Разгибания ног сидя",
						"description": "Изолирующее упражнение для акцентированной проработки четырехглавой мышцы бедра (квадрицепса). Позволяет максимально нагрузить мышцы без вовлечения спины и ягодиц.",
						image: require('@/assets/training-videos/v5/v1.png'),
						imagePosition: { width: "140%", left: -20, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v5/v1.png'),
							require('@/assets/training-videos/v5/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_5.mp4",
						primaryMuscles: ["Квадрицепс"],
						secondaryMuscles: [],
						primaryFrontMuscles: ["leftVastusLateralis", "rightVastusLateralis", "leftVastusMedialis", "rightVastusMedialis", "leftVastusInternedius", "rightVastusInternedius"],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": [],
						secondaryBackMuscles: [],
						tips: [
							"Отрегулируйте спинку так, чтобы подколенный сгиб плотно прилегал к краю сиденья",
							"Валик должен находиться на нижней части голени, прямо над голеностопным суставом",
							"Держитесь за рукоятки по бокам, чтобы таз не отрывался от сиденья при усилии",
							"В верхней точке полностью разгибайте ноги и делайте секундную паузу для пикового сокращения",
							"Опускайте вес плавно, не позволяя плиткам тренажера соприкасаться в нижней точке"
						],
						equipment: ["Тренажер для разгибания ног"],
						difficulty: "Новичок"
					},
					{
						id: "seated-hip-adduction",
						name: "Сведение ног в тренажере сидя",
						"description": "Изолирующее упражнение для проработки внутренней поверхности бедра (приводящих мышц). Помогает укрепить мышцы, которые часто остаются недогруженными в базовых движениях, и улучшить стабильность таза.",
						image: require('@/assets/training-videos/v6/v1.png'),
						imagePosition: { width: "140%", left: -20, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v6/v1.png'),
							require('@/assets/training-videos/v6/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_6.mp4",
						primaryMuscles: ["Приводящие мышцы бедра"],
						secondaryMuscles: [],
						primaryFrontMuscles: [
							"leftVastusMedialis", "rightVastusMedialis",
						],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": [],
						secondaryBackMuscles: [],
						tips: [
							"Отрегулируйте ширину разведения рычагов до комфортного растяжения в исходной точке",
							"Спина должна быть плотно прижата к спинке тренажера на протяжении всего подхода",
							"Выполняйте сведение мощно, делая небольшую паузу в точке максимального сокращения",
							"Медленно возвращайте ноги в исходное положение, контролируя вес и не допуская удара плиток",
							"Держитесь за рукоятки по бокам для лучшей стабилизации корпуса"
						],
						equipment: ["Тренажер для сведения ног"],
						difficulty: "Новичок"
					},
					{
						id: "seated-hip-abduction",
						name: "Разведение ног в тренажере сидя",
						"description": "Изолирующее упражнение для проработки внешней поверхности бедра и ягодичных мышц. Помогает улучшить контур бедер и стабилизировать тазобедренный сустав.",
						image: require('@/assets/training-videos/v7/v1.png'),
						imagePosition: { width: "140%", left: -20, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v7/v1.png'),
							require('@/assets/training-videos/v7/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_7.mp4",
						primaryMuscles: ["Ягодичные мышцы", "Внешняя часть бедра"],
						secondaryMuscles: ["Напрягатель широкой фасции"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": ["leftGluteusMaximus", "rightGluteusMaximus", "leftGluteusMedius", "rightGluteusMedius"],
						secondaryBackMuscles: [],
						tips: [
							"Плотно прижмите спину к сиденью. Для усиления нагрузки на ягодицы можно слегка наклонить корпус вперед",
							"Разводите ноги максимально широко, делая паузу в точке максимального напряжения",
							"Возвращайте ноги в исходное положение медленно, не позволяя грузам полностью опускаться",
							"Держитесь за рукоятки тренажера, чтобы зафиксировать положение таза",
							"Следите, чтобы движение происходило именно в тазобедренных суставах, а не за счет раскачки корпуса"
						],
						equipment: ["Тренажер для разведения ног"],
						difficulty: "Новичок"
					},
					{
						id: "incline-leg-press",
						name: "Жим ногами в тренажере",
						"description": "Фундаментальное упражнение для развития квадрицепсов, ягодиц и бицепсов бедра. Наклонная платформа позволяет работать с большими весами при полной поддержке спины, что делает его безопасной альтернативой приседаниям.",
						image: require('@/assets/training-videos/v10/v1.png'),
						imagePosition: { width: "140%", left: -30, scaleX: -1 },
						images: [
							require('@/assets/training-videos/v10/v1.png'),
							require('@/assets/training-videos/v10/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_10.mp4",
						primaryMuscles: ["Квадрицепс", "Ягодичные мышцы"],
						secondaryMuscles: ["Бицепс бедра", "Икроножные"],
						primaryFrontMuscles: ["leftVastusLateralis", "rightVastusLateralis", "leftVastusMedialis", "rightVastusMedialis", "leftVastusInternedius", "rightVastusInternedius"],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": ["leftGluteusMaximus", "rightGluteusMaximus", "leftGluteusMedius", "rightGluteusMedius"],
						secondaryBackMuscles: ["leftBiceosFemoris", "rightBiceosFemoris", "leftSemitendinosus", "rightSemitendinosus", "leftGastrocnemius", "rightGastrocnemius"],
						tips: [
							"Ставьте стопы на ширине плеч. Высокая постановка больше грузит ягодицы, низкая — квадрицепс",
							"Никогда не выпрямляйте ноги до \"щелчка\" в коленях, оставляйте их слегка согнутыми в верхней точке",
							"Плотно прижимайте поясницу к спинке тренажера, не допускайте подкручивания таза в нижней точке",
							"Опускайте платформу плавно и подконтрольно до угла 90 градусов в коленях",
							"Упирайтесь в платформу всей стопой, делая основной акцент на пятки"
						],
						equipment: ["Тренажер для жима ногами"],
						difficulty: "Средний"
					},
					{
						id: "leg-press-45",
						name: "Жим ногами в тренажере",
						"description": "Базовое упражнение для развития нижней части тела. Позволяет работать с большими весами, акцентируя нагрузку на квадрицепсах и ягодицах, при этом фиксированная спинка минимизирует нагрузку на позвоночник.",
						image: require('@/assets/training-videos/v11/v1.png'),
						imagePosition: { width: "140%", left: -30, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v11/v1.png'),
							require('@/assets/training-videos/v11/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_11.mp4",
						primaryMuscles: ["Квадрицепс", "Ягодичные"],
						secondaryMuscles: ["Бицепс бедра", "Приводящие"],
						primaryFrontMuscles: ["leftVastusLateralis", "rightVastusLateralis", "leftVastusMedialis", "rightVastusMedialis", "leftVastusInternedius", "rightVastusInternedius"],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": ["leftGluteusMaximus", "rightGluteusMaximus", "leftGluteusMedius", "rightGluteusMedius"],
						secondaryBackMuscles: ["leftBiceosFemoris", "rightBiceosFemoris", "leftSemitendinosus", "rightSemitendinosus"],
						tips: [
							"Плотно прижимайте поясницу к спинке тренажера на протяжении всего движения",
							"Не выпрямляйте ноги до конца (не блокируйте колени) в верхней точке",
							"Ставьте стопы на ширине плеч; положение выше на платформе больше грузит ягодицы, ниже — квадрицепс",
							"Опускайте платформу плавно, не допуская отрыва таза от сиденья",
							"Упирайтесь в платформу всей стопой, основной упор делайте на пятки"
						],
						equipment: ["Тренажер для жима ногами"],
						difficulty: "Средний"
					},
					{
						id: "barbell-back-squat",
						name: "Приседания со штангой на плечах",
						"description": "Фундаментальное базовое упражнение, задействующее почти все мышцы нижней части тела и мышцы-стабилизаторы корпуса. Является ключевым для развития общей силы, выносливости и объема ног.",
						image: require('@/assets/training-videos/v17/v1.png'),
						imagePosition: { width: "140%", left: -20, scaleX: -1 },
						images: [
							require('@/assets/training-videos/v17/v1.png'),
							require('@/assets/training-videos/v17/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_17.mp4",
						primaryMuscles: ["Квадрицепс", "Ягодичные мышцы"],
						secondaryMuscles: ["Бицепс бедра", "Приводящие мышцы", "Мышцы поясницы"],
						primaryFrontMuscles: ["leftVastusLateralis", "rightVastusLateralis", "leftVastusMedialis", "rightVastusMedialis", "leftVastusInternedius", "rightVastusInternedius"],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": ["leftGluteusMaximus", "rightGluteusMaximus", "leftGluteusMedius", "rightGluteusMedius"],
						secondaryBackMuscles: ["leftBiceosFemoris", "rightBiceosFemoris", "leftSemitendinosus", "rightSemitendinosus"],
						tips: [
							"Расположите гриф на верхней части трапеций, не кладите его на шею",
							"Держите спину прямой с естественным прогибом в пояснице, взгляд направлен прямо перед собой",
							"Начинайте движение с отведения таза назад, как будто садитесь на невидимый стул",
							"Следите, чтобы колени не заваливались внутрь и двигались в одной плоскости со стопами",
							"Плотно упирайтесь всей стопой в пол, распределяя вес между пяткой и серединой стопы",
							"Выдыхайте на усилии при подъеме вверх"
						],
						equipment: ["Штанга", "Стойки для штанги / Силовая рама"],
						difficulty: "Высокий"
					},
					{
						id: "smith-machine-narrow-squat",
						name: "Приседания в Смите (узкая постановка)",
						"description": "Вариация приседаний в машине Смита, где стопы ставятся максимально близко друг к другу. Это смещает акцент нагрузки на внешнюю часть квадрицепса и позволяет лучше изолировать переднюю поверхность бедра за счет стабильной траектории штанги.",
						image: require('@/assets/training-videos/v18/v1.png'),
						imagePosition: { width: "140%", left: -20, scaleX: -1 },
						images: [
							require('@/assets/training-videos/v18/v1.png'),
							require('@/assets/training-videos/v18/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_18.mp4",
						primaryMuscles: ["Квадрицепс (внешняя часть)"],
						secondaryMuscles: ["Ягодичные мышцы", "Приводящие мышцы"],
						primaryFrontMuscles: ["leftVastusLateralis", "rightVastusLateralis", "leftVastusMedialis", "rightVastusMedialis", "leftVastusInternedius", "rightVastusInternedius"],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": ["leftGluteusMaximus", "rightGluteusMaximus", "leftGluteusMedius", "rightGluteusMedius"],
						secondaryBackMuscles: ["leftBiceosFemoris", "rightBiceosFemoris", "leftSemitendinosus", "rightSemitendinosus"],
						tips: [
							"Поставьте стопы вплотную друг к другу и слегка вынесите их вперед за линию грифа",
							"Прижимайте спину к грифу, опускаясь вертикально вниз, как будто скользите по стене",
							"Опускайтесь до параллели бедер с полом или чуть ниже, сохраняя пятки прижатыми",
							"Держите корпус ровно, не наклоняйтесь сильно вперед",
							"В верхней точке не выпрямляйте ноги до конца, чтобы сохранять напряжение в мышцах"
						],
						equipment: ["Тренажер Смита"],
						difficulty: "Средний"
					},
					{
						id: "standing-glute-kickback-machine",
						name: "Отведения ноги назад в тренажере",
						"description": "Изолирующее упражнение для акцентированной проработки ягодичных мышц. Тренажер фиксирует корпус и задает правильную траекторию, позволяя максимально нагрузить большую ягодичную мышцу без включения мышц спины.",
						image: require('@/assets/training-videos/v44/v1.png'),
						imagePosition: { width: "140%", left: -10, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v44/v1.png'),
							require('@/assets/training-videos/v44/v1.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_44.mp4",
						primaryMuscles: ["Ягодичные мышцы"],
						secondaryMuscles: ["Бицепс бедра"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": ["leftGluteusMaximus", "rightGluteusMaximus", "leftGluteusMedius", "rightGluteusMedius"],
						secondaryBackMuscles: ["leftBiceosFemoris", "rightBiceosFemoris", "leftSemitendinosus", "rightSemitendinosus"],
						tips: [
							"Упритесь грудью или локтями в подушки тренажера, чтобы стабилизировать корпус",
							"Отводите ногу назад плавно, за счет усилия ягодицы, а не рывка поясницей",
							"В точке максимального отведения сделайте паузу и дополнительно сожмите ягодицу",
							"Не прогибайте сильно спину; держите пресс в напряжении на протяжении всего подхода",
							"Возвращайте ногу в исходное положение медленно, не позволяя весу резко падать"
						],
						equipment: ["Тренажер для ягодиц"],
						difficulty: "Новичок"
					},
					{
						id: "hack-squat-machine",
						name: "Гакк-приседания в тренажере",
						"description": "Базовое упражнение для ног, которое имитирует приседания со штангой, но снимает значительную часть нагрузки с мышц-стабилизаторов корпуса. Позволяет максимально глубоко проработать квадрицепсы за счет фиксированной траектории.",
						image: require('@/assets/training-videos/v45/v1.png'),
						imagePosition: { width: "140%", left: -20, scaleX: -1 },
						images: [
							require('@/assets/training-videos/v45/v1.png'),
							require('@/assets/training-videos/v45/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_45.mp4",
						primaryMuscles: ["Квадрицепс"],
						secondaryMuscles: ["Ягодичные", "Бицепс бедра"],
						primaryFrontMuscles: ["leftVastusLateralis", "rightVastusLateralis", "leftVastusMedialis", "rightVastusMedialis", "leftVastusInternedius", "rightVastusInternedius"],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": ["leftGluteusMaximus", "rightGluteusMaximus", "leftGluteusMedius", "rightGluteusMedius"],
						secondaryBackMuscles: ["leftBiceosFemoris", "rightBiceosFemoris", "leftSemitendinosus", "rightSemitendinosus"],
						tips: [
							"Плотно прижмите спину к платформе, чтобы между поясницей и спинкой не было зазора",
							"Стопы ставьте на ширине плеч, не отрывайте пятки от платформы во время приседа",
							"Опускайтесь до тех пор, пока угол в коленях не станет 90 градусов или чуть меньше (если позволяет гибкость)",
							"При подъеме не выпрямляйте колени до конца, оставляйте их слегка согнутыми («мягкими»)",
							"Следите, чтобы колени не заваливались внутрь во время движения"
						],
						equipment: ["Гакк-машина / V-Squat"],
						difficulty: "Средний"
					},
					{
						id: "lever-seated-leg-extension",
						name: "Разгибания ног в рычажном тренажере",
						"description": "Изолирующее упражнение для акцентированной проработки квадрицепсов. Рычажная конструкция обеспечивает более естественную амплитуду движения и позволяет работать над каждой ногой независимо, обеспечивая глубокое пиковое сокращение.",
						image: require('@/assets/training-videos/v48/v1.png'),
						imagePosition: { width: "140%", left: -20, scaleX: -1 },
						images: [
							require('@/assets/training-videos/v48/v1.png'),
							require('@/assets/training-videos/v48/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_48.mp4",
						primaryMuscles: ["Квадрицепс"],
						secondaryMuscles: [],
						primaryFrontMuscles: ["leftVastusLateralis", "rightVastusLateralis", "leftVastusMedialis", "rightVastusMedialis", "leftVastusInternedius", "rightVastusInternedius"],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": [],
						secondaryBackMuscles: [],
						tips: [
							"Прижмите спину плотно к сиденью и держитесь за боковые рукоятки для стабилизации таза",
							"Расположите валик на нижней части голени, прямо над голеностопным суставом",
							"Разгибайте ноги до полного выпрямления, делая паузу в верхней точке для максимального напряжения",
							"Опускайте вес медленно и подконтрольно, не допуская резкого падения рычагов",
							"Держите носки направленными вверх или слегка в стороны для акцента на разные головки квадрицепса"
						],
						equipment: ["Рычажный тренажер для ног"],
						difficulty: "Новичок"
					},
					{
						id: "seated-calf-press-plate-loaded",
						name: "Подъем на носки сидя (рычажный)",
						"description": "Изолирующее упражнение для проработки камбаловидной мышцы голени. Использование свободных весов (блинов) позволяет точно регулировать нагрузку и обеспечивает плавную траекторию движения.",
						image: require('@/assets/training-videos/v49/v1.png'),
						imagePosition: { width: "140%", left: -20, scaleX: -1 },
						images: [
							require('@/assets/training-videos/v49/v1.png'),
							require('@/assets/training-videos/v49/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_49.mp4",
						primaryMuscles: ["Камбаловидная мышца"],
						secondaryMuscles: ["Икроножные мышцы"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": ["leftGastrocnemius", "rightGastrocnemius"],
						secondaryBackMuscles: [],
						tips: [
							"Опустите пятки максимально низко, чтобы почувствовать сильное растяжение в голени",
							"Мощно поднимитесь на носки, задерживаясь в верхней точке на 1-2 секунды",
							"Плотно прижмите колени к подушкам тренажера, спину держите ровно",
							"Двигайтесь плавно, не используйте инерцию и не \"пружиньте\" в нижней точке",
							"Используйте рукоятки, чтобы зафиксировать корпус и избежать лишних движений"
						],
						equipment: ["Тренажер для голени сидя"],
						difficulty: "Новичок"
					},
					{
						id: "elliptical-trainer",
						name: "Эллиптический тренажер",
						"description": "Кардиоупражнение низкой интенсивности, задействующее как нижнюю, так и верхнюю часть тела. Идеально подходит для жиросжигания, разминки или заминки, обеспечивая плавную нагрузку на коленные и голеностопные суставы.",
						image: require('@/assets/training-videos/v63/v1.png'),
						imagePosition: { width: "120%", left: -10, scaleX: 1 },
						images: [require('@/assets/training-videos/v63/v1.png')],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_63.mp4",
						primaryMuscles: ["Сердечно-сосудистая система"],
						secondaryMuscles: ["Квадрицепс", "Ягодичные", "Икроножные", "Мышцы спины"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftVastusLateralis", "rightVastusLateralis", "leftVastusMedialis", "rightVastusMedialis", "leftVastusInternedius", "rightVastusInternedius"],
						"primaryBackMuscles": [],
						secondaryBackMuscles: ["leftGluteusMaximus", "rightGluteusMaximus", "leftGluteusMedius", "rightGluteusMedius", "leftGastrocnemius", "rightGastrocnemius"],
						tips: [
							"Держите спину прямо, не наклоняйтесь сильно вперед и не опирайтесь всем весом на поручни",
							"Старайтесь не отрывать пятки от педалей во время движения для равномерного распределения нагрузки",
							"Используйте подвижные рукоятки, чтобы включить в работу мышцы спины и рук",
							"Двигайтесь плавно, без резких рывков, сохраняя постоянный темп дыхания",
							"Для увеличения интенсивности добавьте уровень сопротивления или измените угол наклона (если тренажер позволяет)"
						],
						equipment: ["Эллиптический тренажер"],
						difficulty: "Новичок"
					},
					{
						id: "stationary-bike-upright",
						name: "Велотренажер (вертикальный)",
						"description": "Эффективное кардиоупражнение для развития выносливости и укрепления сердечно-сосудистой системы. Минимизирует нагрузку на суставы по сравнению с бегом и позволяет точно контролировать интенсивность тренировки.",
						image: require('@/assets/training-videos/v64/v1.png'),
						imagePosition: { width: "130%", left: -15, scaleX: 1 },
						images: [require('@/assets/training-videos/v64/v1.png')],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_64.mp4",
						primaryMuscles: ["Сердечно-сосудистая система"],
						secondaryMuscles: ["Квадрицепс", "Икроножные", "Бицепс бедра"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftVastusLateralis", "rightVastusLateralis", "leftVastusMedialis", "rightVastusMedialis", "leftVastusInternedius", "rightVastusInternedius"],
						"primaryBackMuscles": [],
						secondaryBackMuscles: ["leftGastrocnemius", "rightGastrocnemius", "leftBiceosFemoris", "rightBiceosFemoris", "leftSemitendinosus", "rightSemitendinosus"],
						tips: [
							"Отрегулируйте высоту сиденья так, чтобы в нижней точке нога была почти полностью выпрямлена (но без блокировки колена)",
							"Держите спину ровно, не сутультесь и не переносите весь вес на руки и руль",
							"Старайтесь крутить педали плавно, прилагая усилие по всей окружности движения",
							"Держите стопы параллельно полу, не направляйте носки сильно вниз",
							"Дышите глубоко и равномерно, подбирая сопротивление под свой целевой пульс"
						],
						equipment: ["Велотренажер"],
						difficulty: "Новичок"
					}
				]
			}
		]
	},
	{
		id: "spine",
		name: "Спина",
		image: "manBackMuscleGroupParts.spineFull",
		position: { left: "-103%", "top": "-190%" },
		subgroups: [
			{
				id: "trapezius-upper",
				name: "Верх трапеций",
				"description": "Верхняя часть трапециевидной мышцы. Отвечает за подъём лопаток и шеи.",
				image: "manBackMuscleGroupParts.upperTrapeziusFull",
				exercises: [
					{
						id: "bent-over-barbell-row",
						name: "Тяга штанги в наклоне",
						"description": "Мощное базовое упражнение для развития широчайших мышц, трапеций и всей верхней части спины. Также активно задействует мышцы-разгибатели позвоночника для стабилизации корпуса.",
						image: require('@/assets/training-videos/v12/v2.png'),
						imagePosition: { width: "140%", left: -20, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v12/v1.png'),
							require('@/assets/training-videos/v12/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_12.mp4",
						primaryMuscles: ["Широчайшие", "Трапеции"],
						secondaryMuscles: ["Задняя дельта", "Бицепс", "Разгибатели спины"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftLongBiceps", "rightLongBiceps", "leftShortBiceps", "rightShortBiceps"],
						"primaryBackMuscles": ["leftLatissimusDorsi", "rightLatissimusDorsi", "leftUpperTrapezius", "rightUpperTrapezius", "leftLowerTrapezius", "rightLowerTrapezius"],
						secondaryBackMuscles: ["leftRearDeltoid", "rightRearDeltoid", "leftThoracolumbarFascia", "rightThoracolumbarFascia"],
						tips: [
							"Наклоните торс вперед до угла примерно 45 градусов, сохраняя естественный прогиб в пояснице",
							"Тяните штангу к нижней части живота, ведя локти вдоль корпуса и максимально сводя лопатки в верхней точке",
							"Держите колени слегка согнутыми для лучшей устойчивости и снятия нагрузки с поясницы",
							"Избегайте рывков корпусом; если не получается тянуть плавно, значит вес слишком велик",
							"Опускайте штангу подконтрольно, полностью растягивая мышцы спины в нижней точке"
						],
						equipment: ["Штанга"],
						difficulty: "Средний"
					},
					{
						id: "barbell-deadlift",
						name: "Становая тяга со штангой",
						"description": "Фундаментальное базовое упражнение для развития общей силы и мышечной массы. Оно прорабатывает всю заднюю мышечную цепь: от икроножных мышц и бицепса бедра до широчайших и трапеций.",
						image: require('@/assets/training-videos/v13/v2.png'),
						imagePosition: { width: "130%", left: -15, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v13/v1.png'),
							require('@/assets/training-videos/v13/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_13.mp4",
						primaryMuscles: ["Разгибатели спины", "Ягодицы", "Бицепс бедра"],
						secondaryMuscles: ["Квадрицепс", "Трапеции", "Широчайшие", "Предплечья"],
						primaryFrontMuscles: ["leftVastusLateralis", "rightVastusLateralis", "leftVastusMedialis", "rightVastusMedialis", "leftVastusInternedius", "rightVastusInternedius"],
						secondaryFrontMuscles: ["leftExtensorDigitorum", "rightExtensorDigitorum", "leftFlexorDigitorumProfundus", "rightFlexorDigitorumProfundus"],
						"primaryBackMuscles": ["leftThoracolumbarFascia", "rightThoracolumbarFascia", "leftGluteusMaximus", "rightGluteusMaximus", "leftGluteusMedius", "rightGluteusMedius", "leftBiceosFemoris", "rightBiceosFemoris", "leftSemitendinosus", "rightSemitendinosus"],
						secondaryBackMuscles: ["leftLatissimusDorsi", "rightLatissimusDorsi", "leftUpperTrapezius", "rightUpperTrapezius", "leftLowerTrapezius", "rightLowerTrapezius"],
						tips: [
							"Подойдите к штанге так, чтобы гриф находился над серединой стопы",
							"Держите спину идеально прямой, не допуская округления в пояснице на всех этапах движения",
							"Начинайте подъем за счет мощного толчка ногами в пол, удерживая штангу максимально близко к голеням",
							"В верхней точке полностью выпрямитесь, сводя лопатки, но не отклоняйте корпус избыточно назад",
							"Опускайте штангу подконтрольно, отводя таз назад до момента прохождения грифом уровня колен"
						],
						equipment: ["Штанга"],
						difficulty: "Продвинутый"
					},
					{
						id: "barbell-shrugs",
						name: "Шраги со штангой",
						"description": "Базовое изолирующее упражнение для проработки верхней части трапециевидных мышц. Движение заключается в вертикальном подъеме плеч с отягощением, что позволяет эффективно нагрузить целевую мышцу по всей её оси.",
						image: require('@/assets/training-videos/v14/v2.png'),
						imagePosition: { width: "130%", left: -15, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v14/v1.png'),
							require('@/assets/training-videos/v14/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_14.mp4",
						primaryMuscles: ["Трапеции"],
						secondaryMuscles: ["Предплечья", "Мышцы шеи"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftExtensorDigitorum", "rightExtensorDigitorum", "leftFlexorDigitorumProfundus", "rightFlexorDigitorumProfundus"],
						"primaryBackMuscles": ["leftUpperTrapezius", "rightUpperTrapezius", "leftLowerTrapezius", "rightLowerTrapezius"],
						secondaryBackMuscles: [],
						tips: [
							"Встаньте прямо, удерживая штангу хватом чуть шире плеч",
							"Поднимайте плечи максимально высоко к ушам, двигаясь строго вертикально",
							"Избегайте вращательных движений плечами — это создает лишнюю и опасную нагрузку на суставы",
							"В верхней точке сделайте паузу на 1 секунду для пикового сокращения мышц",
							"Медленно опускайте штангу вниз, полностью растягивая трапеции, но не расслабляя их до конца"
						],
						equipment: ["Штанга"],
						difficulty: "Новичок"
					},
					{
						id: "machine-seated-row-hammer",
						name: "Горизонтальная тяга в тренажере (Hammer)",
						"description": "Эффективное упражнение для развития толщины спины. Независимые рычаги тренажера позволяют работать каждой рукой по отдельности, что помогает устранить мышечный дисбаланс и добиться глубокого сокращения мышц.",
						image: require('@/assets/training-videos/v46/v2.png'),
						imagePosition: { width: "130%", left: -15, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v46/v1.png'),
							require('@/assets/training-videos/v46/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_46.mp4",
						primaryMuscles: ["Широчайшие", "Ромбовидные"],
						secondaryMuscles: ["Трапеции (нижняя часть)", "Задняя дельта", "Бицепс"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftLongBiceps", "rightLongBiceps", "leftShortBiceps", "rightShortBiceps"],
						"primaryBackMuscles": ["leftLatissimusDorsi", "rightLatissimusDorsi"],
						secondaryBackMuscles: ["leftLowerTrapezius", "rightLowerTrapezius", "leftRearDeltoid", "rightRearDeltoid"],
						tips: [
							"Отрегулируйте высоту сиденья так, чтобы рукояти находились на уровне нижней части груди или верха живота",
							"Плотно прижмитесь грудью к опорной подушке, сохраняя спину прямой",
							"Тяните рукояти на себя, стараясь максимально отвести локти назад и свести лопатки вместе",
							"Делайте выдох на усилии (тяга к себе) и вдох при возвращении в исходное положение",
							"Не позволяйте весу полностью опускаться в нижней точке, чтобы сохранять напряжение в мышцах спины"
						],
						equipment: ["Рычажный тренажер"],
						difficulty: "Новичок"
					},
					{
						id: "bent-over-t-bar-row-free",
						name: "Тяга Т-грифа в наклоне",
						"description": "Классическое упражнение для развития толщины и плотности спины. Свободная траектория движения позволяет максимально естественно свести лопатки и нагрузить широчайшие, ромбовидные и трапециевидные мышцы.",
						image: require('@/assets/training-videos/v50/v1.png'),
						imagePosition: { width: "135%", left: -15, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v50/v1.png'),
							require('@/assets/training-videos/v50/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_50.mp4",
						primaryMuscles: ["Широчайшие", "Трапеции"],
						secondaryMuscles: ["Ромбовидные", "Разгибатели спины", "Задняя дельта", "Бицепс"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftLongBiceps", "rightLongBiceps", "leftShortBiceps", "rightShortBiceps"],
						"primaryBackMuscles": ["leftLatissimusDorsi", "rightLatissimusDorsi", "leftUpperTrapezius", "rightUpperTrapezius", "leftLowerTrapezius", "rightLowerTrapezius"],
						secondaryBackMuscles: ["leftThoracolumbarFascia", "rightThoracolumbarFascia", "leftRearDeltoid", "rightRearDeltoid"],
						tips: [
							"Встаньте над грифом, слегка согните колени и наклоните корпус вперед с прямой спиной",
							"Тяните рукоять к нижней части живота, концентрируясь на движении локтей назад и вверх",
							"В верхней точке максимально сведите лопатки и задержитесь на долю секунды",
							"Медленно опускайте вес, полностью растягивая мышцы спины, но не позволяя блинам касаться пола",
							"Держите пресс в напряжении на протяжении всего подхода, чтобы стабилизировать поясницу"
						],
						equipment: ["Т-гриф"],
						difficulty: "Средний"
					},
					{
						id: "chest-supported-t-bar-row",
						name: "Тяга Т-грифа с упором в грудь",
						"description": "Эффективное упражнение для развития толщины спины. Упор грудью изолирует целевые мышцы, предотвращая использование инерции и снимая осевую нагрузку с позвоночника.",
						image: require('@/assets/training-videos/v51/v2.png'),
						imagePosition: { width: "135%", left: -20, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v51/v1.png'),
							require('@/assets/training-videos/v51/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_51.mp4",
						primaryMuscles: ["Широчайшие", "Ромбовидные"],
						secondaryMuscles: ["Трапеции", "Задняя дельта", "Бицепс"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftLongBiceps", "rightLongBiceps", "leftShortBiceps", "rightShortBiceps"],
						"primaryBackMuscles": ["leftLatissimusDorsi", "rightLatissimusDorsi"],
						secondaryBackMuscles: ["leftUpperTrapezius", "rightUpperTrapezius", "leftLowerTrapezius", "rightLowerTrapezius", "leftRearDeltoid", "rightRearDeltoid"],
						tips: [
							"Отрегулируйте высоту упора так, чтобы верхний край подушки находился на уровне верха груди",
							"Плотно прижмитесь грудью к платформе и сохраняйте это положение до конца подхода",
							"Тяните вес к животу, концентрируясь на движении локтей назад и сведении лопаток",
							"Избегайте чрезмерного вытягивания шеи вперед — держите голову в одну линию с позвоночником",
							"В нижней точке полностью выпрямляйте руки, чтобы максимально растянуть широчайшие"
						],
						equipment: ["Тренажер Т-гриф с упором"],
						difficulty: "Новичок"
					},
					{
						id: "leverage-seated-row-supported",
						name: "Рычажная тяга с упором грудью",
						"description": "Эффективное упражнение для акцентированной проработки середины спины и широчайших. Упор в грудь позволяет полностью изолировать целевые мышцы, исключая читинг и снижая риск травм поясничного отдела.",
						image: require('@/assets/training-videos/v52/v2.png'),
						imagePosition: { width: "135%", left: 0, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v52/v1.png'),
							require('@/assets/training-videos/v52/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_52.mp4",
						primaryMuscles: ["Широчайшие", "Ромбовидные"],
						secondaryMuscles: ["Трапеции (средняя и нижняя части)", "Задняя дельта", "Бицепс"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftLongBiceps", "rightLongBiceps", "leftShortBiceps", "rightShortBiceps"],
						"primaryBackMuscles": ["leftLatissimusDorsi", "rightLatissimusDorsi"],
						secondaryBackMuscles: ["leftUpperTrapezius", "rightUpperTrapezius", "leftLowerTrapezius", "rightLowerTrapezius", "leftRearDeltoid", "rightRearDeltoid"],
						tips: [
							"Отрегулируйте сиденье так, чтобы рукоятки были на уровне середины вашего пресса или чуть выше",
							"Плотно прижмитесь грудью к подушке и сохраняйте контакт на протяжении всего подхода",
							"Тяните рычаги на себя мощным движением локтей назад, сводя лопатки в финальной точке",
							"Медленно возвращайте рукоятки в исходное положение, чувствуя растяжение мышц спины",
							"Старайтесь тянуть именно спиной, а не руками — представляйте локти как крюки"
						],
						equipment: ["Рычажный тренажер"],
						difficulty: "Новичок"
					},
					{
						id: "v-bar-lat-pulldown",
						name: "Вертикальная тяга параллельным хватом",
						"description": "Базовое упражнение для проработки широчайших мышц спины. Использование параллельного хвата позволяет увеличить амплитуду движения и сместить акцент на нижние отделы широчайших, а также на ромбовидные мышцы.",
						image: require('@/assets/training-videos/v53/v1.png'),
						imagePosition: { width: "130%", left: -15, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v53/v1.png'),
							require('@/assets/training-videos/v53/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_53.mp4",
						primaryMuscles: ["Широчайшие"],
						secondaryMuscles: ["Ромбовидные", "Бицепс", "Задняя дельта", "Нижняя часть трапеций"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftLongBiceps", "rightLongBiceps", "leftShortBiceps", "rightShortBiceps"],
						"primaryBackMuscles": ["leftLatissimusDorsi", "rightLatissimusDorsi"],
						secondaryBackMuscles: ["leftLowerTrapezius", "rightLowerTrapezius", "leftRearDeltoid", "rightRearDeltoid"],
						tips: [
							"Слегка отклоните корпус назад и зафиксируйте ноги под валиками тренажера",
							"Тяните рукоять к верхней части груди, концентрируясь на том, чтобы вести локти вниз и сводить лопатки",
							"В нижней точке сделайте небольшую паузу, максимально сжимая мышцы спины",
							"Контролируйте возвращение рукояти вверх, полностью растягивая широчайшие, но не расслабляя их",
							"Избегайте сильной раскачки корпусом; движение должно быть подконтрольным"
						],
						equipment: ["Блочный тренажер", "V-образная рукоять"],
						difficulty: "Новичок"
					},
					{
						id: "wide-grip-lat-pulldown",
						name: "Тяга верхнего блока к груди (широкий хват)",
						"description": "Базовое упражнение для развития ширины спины. Широкий хват позволяет максимально изолировать широчайшие мышцы, минимизируя работу бицепсов по сравнению с узким хватом.",
						image: require('@/assets/training-videos/v54/v1.png'),
						imagePosition: { width: "130%", left: -10, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v54/v1.png'),
							require('@/assets/training-videos/v54/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_54.mp4",
						primaryMuscles: ["Широчайшие"],
						secondaryMuscles: ["Большая круглая мышца", "Задняя дельта", "Трапеции (нижняя часть)", "Бицепс"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftLongBiceps", "rightLongBiceps", "leftShortBiceps", "rightShortBiceps"],
						"primaryBackMuscles": ["leftLatissimusDorsi", "rightLatissimusDorsi"],
						secondaryBackMuscles: ["leftLowerTrapezius", "rightLowerTrapezius", "leftRearDeltoid", "rightRearDeltoid"],
						tips: [
							"Возьмитесь за гриф хватом шире плеч, ладонями от себя",
							"Тяните гриф к верхней части груди, отклоняя локти немного назад и сводя лопатки",
							"Старайтесь тянуть именно локтями, а не кистями, чтобы выключить бицепс из работы",
							"Не отклоняйте корпус слишком сильно назад — сохраняйте небольшое контролируемое отклонение",
							"Медленно возвращайте гриф вверх, полностью растягивая широчайшие в верхней точке"
						],
						equipment: ["Блочный тренажер", "Длинная рукоять"],
						difficulty: "Новичок"
					},
					{
						id: "seated-lever-row-parallel-grip",
						name: "Рычажная тяга параллельным хватом",
						"description": "Базовое упражнение в тренажере для проработки толщины спины. Нейтральный хват обеспечивает наиболее естественную траекторию движения для локтевых суставов, позволяя максимально свести лопатки и нагрузить центр спины.",
						image: require('@/assets/training-videos/v55/v1.png'),
						imagePosition: { width: "135%", left: -20, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v55/v1.png'),
							require('@/assets/training-videos/v55/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_55.mp4",
						primaryMuscles: ["Широчайшие", "Ромбовидные"],
						secondaryMuscles: ["Трапеции (средняя часть)", "Задняя дельта", "Бицепс", "Брахиалис"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftLongBiceps", "rightLongBiceps", "leftShortBiceps", "rightShortBiceps"],
						"primaryBackMuscles": ["leftLatissimusDorsi", "rightLatissimusDorsi"],
						secondaryBackMuscles: ["leftUpperTrapezius", "rightUpperTrapezius", "leftLowerTrapezius", "rightLowerTrapezius", "leftRearDeltoid", "rightRearDeltoid"],
						tips: [
							"Сядьте ровно, упритесь ногами в платформы и возьмитесь за параллельные рукояти",
							"Притяните рукояти к себе, стараясь вести локти вплотную к туловищу",
							"В конечной точке максимально сведите лопатки и сделайте паузу на пиковом сокращении",
							"Плавно возвращайте вес в исходное положение, полностью распрямляя руки и растягивая спину",
							"Держите грудь расправленной и не позволяйте плечам подниматься к ушам"
						],
						equipment: ["Рычажный тренажер"],
						difficulty: "Новичок"
					},
					{
						id: "diverging-lat-pulldown-machine",
						name: "Тяга верхнего блока (дуговой тренажёр)",
						"description": "Упражнение на рычажном тренажёре с дуговой траекторией движения. Такая конструкция имитирует естественное движение рук, обеспечивая максимальное растяжение в верхней точке и глубокую проработку широчайших в нижней.",
						image: require('@/assets/training-videos/v56/v1.png'),
						imagePosition: { width: "135%", left: -15, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v56/v1.png'),
							require('@/assets/training-videos/v56/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_56.mp4",
						primaryMuscles: ["Широчайшие"],
						secondaryMuscles: ["Большая круглая мышца", "Задняя дельта", "Трапеции (нижняя часть)", "Бицепс"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftLongBiceps", "rightLongBiceps", "leftShortBiceps", "rightShortBiceps"],
						"primaryBackMuscles": ["leftLatissimusDorsi", "rightLatissimusDorsi"],
						secondaryBackMuscles: ["leftLowerTrapezius", "rightLowerTrapezius", "leftRearDeltoid", "rightRearDeltoid"],
						tips: [
							"Отрегулируйте валики так, чтобы бедра были плотно зафиксированы",
							"Возьмитесь за рукояти и тяните их вниз, концентрируясь на том, чтобы локти уходили в стороны и вниз по дуге",
							"В нижней точке движения максимально сведите лопатки, раскрывая грудную клетку",
							"Медленно возвращайте рукояти вверх, полностью растягивая широчайшие мышцы",
							"Старайтесь не помогать себе рывками корпуса — спина должна быть неподвижной"
						],
						equipment: ["Дуговой тренажёр"],
						difficulty: "Новичок"
					},
					{
						id: "hyperextension",
						name: "Гиперэкстензия",
						"description": "Упражнение для укрепления выпрямителей позвоночника, ягодиц и бицепсов бедра. Помогает улучшить осанку и стабилизировать поясничный отдел, что критически важно при выполнении тяжелых базовых упражнений.",
						image: require('@/assets/training-videos/v57/v2.png'),
						imagePosition: { width: "135%", left: -30, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v57/v1.png'),
							require('@/assets/training-videos/v57/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_57.mp4",
						primaryMuscles: ["Разгибатели спины"],
						secondaryMuscles: ["Ягодичные", "Бицепс бедра"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: [],
						"primaryBackMuscles": ["leftThoracolumbarFascia", "rightThoracolumbarFascia"],
						secondaryBackMuscles: ["leftGluteusMaximus", "rightGluteusMaximus", "leftGluteusMedius", "rightGluteusMedius", "leftBiceosFemoris", "rightBiceosFemoris", "leftSemitendinosus", "rightSemitendinosus"],
						tips: [
							"Настройте тренажер так, чтобы верхний край подушек находился чуть ниже линии сгиба бедра",
							"Опускайтесь плавно, сохраняя спину прямой, до ощущения растяжения в задней поверхности бедра",
							"Поднимайтесь до прямой линии с корпусом. Не допускайте чрезмерного переразгибания (прогиба) в пояснице в верхней точке",
							"Держите руки скрещенными на груди или за головой (без давления на шею)",
							"Выполняйте движение подконтрольно, избегая инерции и рывков"
						],
						equipment: ["Тренажер для гиперэкстензии"],
						difficulty: "Новичок"
					},
					{
						id: "wide-grip-pull-ups",
						name: "Подтягивания широким хватом",
						"description": "Фундаментальное упражнение с собственным весом для развития широчайших мышц спины. Широкая постановка рук максимально акцентирует нагрузку на внешних отделах спины, создавая выразительный V-образный силуэт.",
						image: require('@/assets/training-videos/v60/v2.png'),
						imagePosition: { width: "130%", left: 0, scaleX: 1 },
						images: [
							require('@/assets/training-videos/v60/v1.png'),
							require('@/assets/training-videos/v60/v2.png')
						],
						videoUrl: "https://pub-4059e1140cbe4425b7bfe58afa6e7a85.r2.dev/training-videos/video_60.mp4",
						primaryMuscles: ["Широчайшие"],
						secondaryMuscles: ["Большая круглая мышца", "Задняя дельта", "Бицепс", "Трапеции (нижняя часть)", "Предплечья"],
						primaryFrontMuscles: [],
						secondaryFrontMuscles: ["leftLongBiceps", "rightLongBiceps", "leftShortBiceps", "rightShortBiceps", "leftExtensorDigitorum", "rightExtensorDigitorum", "leftFlexorDigitorumProfundus", "rightFlexorDigitorumProfundus"],
						"primaryBackMuscles": ["leftLatissimusDorsi", "rightLatissimusDorsi"],
						secondaryBackMuscles: ["leftLowerTrapezius", "rightLowerTrapezius", "leftRearDeltoid", "rightRearDeltoid"],
						tips: [
							"Возьмитесь за перекладину хватом значительно шире плеч",
							"Тянитесь грудью к перекладине, концентрируясь на сведении лопаток и движении локтей вниз",
							"Избегайте раскачки (киппинга) — движение должно быть строгим и подконтрольным",
							"В верхней точке постарайтесь коснуться перекладины верхней частью груди",
							"Медленно опускайтесь вниз до полного растяжения мышц, но не расслабляйте плечи полностью в нижней точке"
						],
						equipment: ["Турник"],
						difficulty: "Средний"
					}
				]
			}
		]
	}
]