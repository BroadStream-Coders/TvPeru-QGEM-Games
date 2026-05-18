import JSZip from "jszip";

export const loadJsonFile = <T>(
  file: File,
  validator?: (data: unknown) => boolean,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (validator && !validator(data)) {
          return reject(
            new Error("Estructura de archivo no válida para este colector."),
          );
        }

        resolve(data as T);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

export const loadZipFile = async (file: File): Promise<JSZip> => {
  try {
    const zip = await JSZip.loadAsync(file);
    return zip;
  } catch {
    throw new Error("No se pudo leer el archivo ZIP.");
  }
};
