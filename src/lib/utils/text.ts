export const humanizeId = (value: string): string =>
	value
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[_.-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim() || value;

export const actionLabelFromId = (eventId: string): string => {
	const lastSegment = eventId.split('.').pop() ?? eventId;
	return humanizeId(lastSegment);
};
