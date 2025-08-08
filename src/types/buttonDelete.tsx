export interface ButtonDeleteProps {
    config: {
        id: string;
        title: string;
        description: string;
        apiEndpoint: string;
        urlRevalidate: string[];
        tags?: string[];
    }
}
