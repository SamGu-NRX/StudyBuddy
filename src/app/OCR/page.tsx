import { Container, Paper, Title, Text, Space } from '@mantine/core';
import OCR from "@/components/OCR/OCR";

const Home = () => {
  return (
    <Container size="lg" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={1} align="center" mb="lg">
          OCR Image Text Extractor
        </Title>
        <Text align="center" c="dimmed" mb="xl">
          Upload an image, crop it if needed, and extract text using OCR technology.
        </Text>
        <Space h="md" />
        <OCR />
      </Paper>
    </Container>
  );
}

export default Home;