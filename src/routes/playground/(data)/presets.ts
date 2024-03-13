export type Preset = {
	id: string;
	name: string;
};

export const presets: Preset[] = [
	{
		id: "96-well", // 12 x 8
    name: "96-well plate (12 x 8)"
	},
	{
		id: "384-well", // 24 x 16
		name: "384-well plate (24 x 16)"
	}
];
