import { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Text,
    Progress,
    Loader,
    Stack,
    Center,
    Box,
    Transition,
    Flex
} from '@mantine/core';
import { useTrackProgress } from '../../../../../dist';

const LoadingScreen = () => {
    const [loadingText, setLoadingText] = useState('Loading resources...');

    const { progress,
        currentResource,
        totalResources,
        currentResourceName
    } = useTrackProgress({
        onBeforeResourcesLoaded: () => console.log('Loading started'),
        onAllResourcesLoaded: () => console.log('Loading completed'),
        isLoadAssets: {
            isLoadMusic: true,
            isLoadVideo: true,
            isLoadImage: true,
        },
    });

    useEffect(() => {
        if (progress === 0) {
            setLoadingText('Initializing...');
        } else if (progress < 100) {
            setLoadingText('Loading resources...');
        } else setLoadingText('Resources loaded');

    }, [progress]);


    return (<Container size="sm" h="100vh">
        <Center h="100%">
            <Paper shadow="xl" p={40} radius="md" w="100%">
                <Stack >
                    <Box ta="center">
                        <Transition
                            mounted={progress < 100}
                            transition="fade"
                            duration={400}
                        >
                            {(styles) => (
                                <Loader size="xl" style={styles} />
                            )}
                        </Transition>

                        <Text size="xl" fw={600} mt="md">
                            {loadingText}
                        </Text>
                    </Box>


                    <Progress
                        value={progress}
                        size="lg"
                        radius="xl"
                        striped
                        animated={progress < 100}
                    />
                    <Flex direction="column" align="center" h="100%" w="100%">
                        <Text size="sm" c="dimmed" fw={500}>
                            {Math.round(progress)}%
                        </Text>

                        <Text size="sm" c="dimmed" fw={500}>
                            {currentResource}/{totalResources}
                        </Text>
                        <Transition
                            mounted={!!currentResourceName}
                            transition="slide-up"
                            duration={400}
                        >
                            {(styles) => (
                                <Text
                                    ta="center"
                                    size="sm"
                                    c="dimmed"
                                    style={styles}
                                >
                                    {currentResourceName}
                                </Text>
                            )}
                        </Transition>
                    </Flex>

                </Stack>
            </Paper>
        </Center>
    </Container>
    );
};

export default LoadingScreen;