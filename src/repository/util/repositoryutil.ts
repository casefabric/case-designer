export function getSimpleModelName(fullName: string): string {
    return fullName.split('\\').pop()!;
}
