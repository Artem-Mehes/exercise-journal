import { clsx } from "clsx";

const height = 150;

const halfHeight = height / 2;

const barbellHeight = 20;

const barbellSvgConfig = {
	height: barbellHeight,
	rx: 5,
	firstElement: {
		width: 70,
	},
	secondElement: {
		width: 10,
		height: barbellHeight * 2,
	},
	thirdElement: {
		width: 200,
	},
	plates: {
		lbs: {
			5: {
				width: 17,
				height: barbellHeight * 3,
				fill: "fill-white",
				rx: 3,
			},
			10: {
				width: 20,
				height: barbellHeight * 4,
				fill: "fill-blue-100",
				rx: 4,
			},
			25: {
				width: 23,
				height: barbellHeight * 5,
				fill: "fill-blue-300",
				rx: 4,
			},
			35: {
				width: 27,
				height: barbellHeight * 6,
				fill: "fill-blue-500",
				rx: 5,
			},
			45: {
				width: 30,
				height: barbellHeight * 7,
				fill: "fill-blue-700",
				rx: 6,
			},
		},
		kg: {
			5: {
				width: 17,
				height: barbellHeight * 3,
				fill: "fill-white",
				rx: 3,
			},
			10: {
				width: 20,
				height: barbellHeight * 4,
				fill: "fill-blue-100",
				rx: 4,
			},
			20: {
				width: 23,
				height: barbellHeight * 5,
				fill: "fill-blue-300",
				rx: 4,
			},
			25: {
				width: 30,
				height: barbellHeight * 7,
				fill: "fill-blue-700",
				rx: 6,
			},
		},
	},
};

const platesSpacing = 0;

const barbellColor = "fill-slate-500 stroke-black";

export const BarbellSvg = ({
	unit,
	selectedPlates,
	onRemovePlate,
	barbellWeight,
}: {
	unit: "lbs" | "kg";
	selectedPlates: number[];
	onRemovePlate: ({ plate, index }: { plate: number; index: number }) => void;
	barbellWeight: number;
}) => {
	const middleY = halfHeight;

	const getCenteredY = (elementHeight: number) => middleY - elementHeight / 2;

	return (
		<svg
			height={height}
			width={280}
			viewBox={`0 0 280 ${height}`}
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Barbell Visualization</title>

			<g>
				<rect
					className={barbellColor}
					width={barbellSvgConfig.firstElement.width}
					height={barbellSvgConfig.height}
					y={getCenteredY(barbellSvgConfig.height)}
					rx={2}
				/>

				<text
					x={barbellSvgConfig.firstElement.width / 2}
					y={halfHeight}
					className="text-xs fill-black"
					textAnchor="middle"
					dominantBaseline="middle"
				>
					{barbellWeight} {unit}
				</text>
			</g>

			<rect
				className={barbellColor}
				width={barbellSvgConfig.secondElement.width}
				height={barbellSvgConfig.secondElement.height}
				y={getCenteredY(barbellSvgConfig.secondElement.height)}
				x={barbellSvgConfig.firstElement.width}
				stroke="black"
				rx={2}
			/>

			<rect
				className={barbellColor}
				height={barbellSvgConfig.height}
				width={barbellSvgConfig.thirdElement.width}
				x={
					barbellSvgConfig.firstElement.width +
					barbellSvgConfig.secondElement.width
				}
				y={getCenteredY(barbellSvgConfig.height)}
				stroke="black"
				rx={3}
			/>

			{selectedPlates.map((plate, index, array) => {
				const plateConfig =
					barbellSvgConfig.plates[unit]?.[
						plate as keyof (typeof barbellSvgConfig.plates)[typeof unit]
					];

				// Skip rendering if plate configuration doesn't exist
				if (!plateConfig) {
					console.warn(`No configuration found for ${plate} ${unit} plate`);
					return null;
				}

				const previousPlatesWidth = array
					.slice(0, index)
					.reduce((acc, plate) => {
						const plateConfig =
							barbellSvgConfig.plates[unit]?.[
								plate as keyof (typeof barbellSvgConfig.plates)[typeof unit]
							];
						return acc + (plateConfig?.width || 0);
					}, 0);

				const barbellElementsWidth =
					barbellSvgConfig.firstElement.width +
					barbellSvgConfig.secondElement.width;

				return (
					<g
						key={index}
						onClick={() => {
							onRemovePlate({ plate, index });
						}}
					>
						<rect
							x={
								barbellElementsWidth +
								previousPlatesWidth +
								index * platesSpacing
							}
							y={getCenteredY(plateConfig.height)}
							className={clsx(`${plateConfig.fill}`, "stroke-black")}
							width={plateConfig.width}
							height={plateConfig.height}
							rx={plateConfig.rx}
						/>

						<text
							x={
								barbellElementsWidth +
								previousPlatesWidth +
								index * platesSpacing +
								plateConfig.width / 2
							}
							y={middleY}
							className={clsx("text-xs", "fill-black")}
							textAnchor="middle"
							dominantBaseline="middle"
						>
							{plate}
						</text>
					</g>
				);
			})}
		</svg>
	);
};
