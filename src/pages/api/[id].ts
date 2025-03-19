export const prerender = false;

import type { APIRoute } from "astro";

interface Data {
	[key: string]: {
		date: string;
		time: string;
		code: string;
		title: string;
		sum_student: number;
		group: {
			building: string;
			room: string;
			students: number;
			range: string;
		}[];
	};
}

export const GET: APIRoute = async ({ params, request }) => {
	const response = await fetch(import.meta.env.FILE_PATH);
	const data = await response.json() as Data;

	const id = Number(params.id);

	const groups = Object.entries(data).map(([_, subject]) => {
		const group = subject.group.filter(({ range }) => {
			const ranges = range.split(",").map(range => range.split("-").map(Number));
			return ranges.some(([start, end = start]) => id >= start && id <= end);
		});

		return { ...subject, group };
	}).filter(({ group }) => group.length > 0);

	return new Response(JSON.stringify(groups), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
