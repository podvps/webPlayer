import { FileNode } from '@/types/FileNode';
export type { FileNode };

// 文件目录数据
export const fileTreeData: FileNode[] = [
  {
    id: '1',
    name: '视频库',
    type: 'folder',
    parentId: null,
    path: '/视频库',
    children: [
      {
        id: '2',
        name: '电影',
        type: 'folder',
        parentId: '1',
        path: '/视频库/电影',
        children: [
          {
            id: '3',
            name: '科幻',
            type: 'folder',
            parentId: '2',
            path: '/视频库/电影/科幻',
            children: [
              {
                id: '4',
                name: 'S01E01.AlphablocksAlphablocksAlphablocksAlphablocksAlphablocks.mp4',
                type: 'file',
                parentId: '3',
                path: '/media/S01E01.Alphablocks.mp4',
                size: 52838400, // 实际文件大小约50MB
                lastModified: 1678900000000,
              },
              {
                id: '5',
                name: 'S02E01.Taps.mp4',
                type: 'file',
                parentId: '3',
                path: '/media/S02E01.Taps.mp4',
                size: 1073741824, // 约1GB
                lastModified: 1678800000000,
              },
              {
                id: '14',
                name: '银翼杀手2049.mp4',
                type: 'file',
                parentId: '3',
                path: '/media/银翼杀手2049.mp4',
                size: 1835008000, // 约1.7GB
                lastModified: 1678750000000,
              },
              {
                id: '15',
                name: '黑客帝国.mp4',
                type: 'file',
                parentId: '3',
                path: '/media/黑客帝国.mp4',
                size: 1288490189, // 约1.2GB
                lastModified: 1678720000000,
              },
              {
                id: '16',
                name: '异形.mp4',
                type: 'file',
                parentId: '3',
                path: '/media/异形.mp4',
                size: 966367642, // 约920MB
                lastModified: 1678700000000,
              },
              {
                id: '17',
                name: '火星救援.mp4',
                type: 'file',
                parentId: '3',
                path: '/media/火星救援.mp4',
                size: 1610612736, // 约1.5GB
                lastModified: 1678680000000,
              },
              {
                id: '18',
                name: '降临.mp4',
                type: 'file',
                parentId: '3',
                path: '/media/降临.mp4',
                size: 1342177280, // 约1.25GB
                lastModified: 1678650000000,
              },
            ],
          },
          {
            id: '6',
            name: '动作',
            type: 'folder',
            parentId: '2',
            path: '/视频库/电影/动作',
            children: [
              {
                id: '7',
                name: '速度与激情9.mp4',
                type: 'file',
                parentId: '6',
                path: '/media/速度与激情9.mp4',
                size: 2147483648, // 约2GB
                lastModified: 1678700000000,
              },
              {
                id: '19',
                name: '碟中谍7.mp4',
                type: 'file',
                parentId: '6',
                path: '/media/碟中谍7.mp4',
                size: 2415919104, // 约2.25GB
                lastModified: 1678680000000,
              },
              {
                id: '20',
                name: '复仇者联盟4.mp4',
                type: 'file',
                parentId: '6',
                path: '/media/复仇者联盟4.mp4',
                size: 2852126720, // 约2.65GB
                lastModified: 1678660000000,
              },
              {
                id: '21',
                name: '速度与激情8.mp4',
                type: 'file',
                parentId: '6',
                path: '/media/速度与激情8.mp4',
                size: 1932735283, // 约1.8GB
                lastModified: 1678640000000,
              },
              {
                id: '22',
                name: '007：无暇赴死.mp4',
                type: 'file',
                parentId: '6',
                path: '/media/007：无暇赴死.mp4',
                size: 2348810240, // 约2.2GB
                lastModified: 1678620000000,
              },
            ],
          },
          {
            id: '23',
            name: '喜剧',
            type: 'folder',
            parentId: '2',
            path: '/视频库/电影/喜剧',
            children: [
              {
                id: '24',
                name: '疯狂动物城.mp4',
                type: 'file',
                parentId: '23',
                path: '/media/疯狂动物城.mp4',
                size: 1509949440, // 约1.4GB
                lastModified: 1678600000000,
              },
              {
                id: '25',
                name: '心灵奇旅.mp4',
                type: 'file',
                parentId: '23',
                path: '/media/心灵奇旅.mp4',
                size: 1374389535, // 约1.3GB
                lastModified: 1678580000000,
              },
            ],
          },
          {
            id: '26',
            name: '剧情',
            type: 'folder',
            parentId: '2',
            path: '/视频库/电影/剧情',
            children: [
              {
                id: '27',
                name: '肖申克的救赎.mp4',
                type: 'file',
                parentId: '26',
                path: '/media/肖申克的救赎.mp4',
                size: 1207959552, // 约1.13GB
                lastModified: 1678560000000,
              },
              {
                id: '28',
                name: '阿甘正传.mp4',
                type: 'file',
                parentId: '26',
                path: '/media/阿甘正传.mp4',
                size: 1107296256, // 约1.03GB
                lastModified: 1678540000000,
              },
            ],
          },
        ],
      },
      {
        id: '8',
        name: '纪录片',
        type: 'folder',
        parentId: '1',
        path: '/视频库/纪录片',
        children: [
          {
            id: '9',
            name: '蓝色星球.mp4',
            type: 'file',
            parentId: '8',
            path: '/media/蓝色星球.mp4',
            size: 734003200, // 约700MB
            lastModified: 1678600000000,
          },
          {
            id: '29',
            name: '地球脉动.mp4',
            type: 'file',
            parentId: '8',
            path: '/media/地球脉动.mp4',
            size: 838860800, // 约800MB
            lastModified: 1678580000000,
          },
          {
            id: '30',
            name: '人类星球.mp4',
            type: 'file',
            parentId: '8',
            path: '/media/人类星球.mp4',
            size: 939524096, // 约895MB
            lastModified: 1678560000000,
          },
          {
            id: '31',
            name: '宇宙的奥秘.mp4',
            type: 'file',
            parentId: '8',
            path: '/media/宇宙的奥秘.mp4',
            size: 786432000, // 约750MB
            lastModified: 1678540000000,
          },
          {
            id: '32',
            name: '深海探秘.mp4',
            type: 'file',
            parentId: '8',
            path: '/media/深海探秘.mp4',
            size: 880803840, // 约840MB
            lastModified: 1678520000000,
          },
          {
            id: '33',
            name: '自然界的奇观.mp4',
            type: 'file',
            parentId: '8',
            path: '/media/自然界的奇观.mp4',
            size: 681574400, // 约650MB
            lastModified: 1678500000000,
          },
        ],
      },
      {
        id: '34',
        name: '电视剧',
        type: 'folder',
        parentId: '1',
        path: '/视频库/电视剧',
        children: [
          {
            id: '35',
            name: '老友记.mp4',
            type: 'file',
            parentId: '34',
            path: '/media/老友记.mp4',
            size: 4294967296, // 约4GB
            lastModified: 1678480000000,
          },
          {
            id: '36',
            name: '权力的游戏.mp4',
            type: 'file',
            parentId: '34',
            path: '/media/权力的游戏.mp4',
            size: 5368709120, // 约5GB
            lastModified: 1678460000000,
          },
          {
            id: '37',
            name: '绝命毒师.mp4',
            type: 'file',
            parentId: '34',
            path: '/media/绝命毒师.mp4',
            size: 4831838208, // 约4.5GB
            lastModified: 1678440000000,
          },
        ],
      },
      {
        id: '10',
        name: '生活记录.mp4',
        type: 'file',
        parentId: '1',
        path: '/media/生活记录.mp4',
        size: 524288000, // 约500MB
        lastModified: 1678500000000,
      },
      {
        id: '13',
        name: 'View_From_A_Blue_Moon_Trailer-720pView_From_A_Blue_Moon_Trailer-720p.mp4',
        type: 'file',
        parentId: '1',
        path: '/media/View_From_A_Blue_Moon_Trailer-720p.mp4',
        size: 536870912, // 约500MB
        lastModified: 1679000000000,
      },
      {
        id: '38',
        name: '家庭聚会视频.mp4',
        type: 'file',
        parentId: '1',
        path: '/media/家庭聚会视频.mp4',
        size: 629145600, // 约600MB
        lastModified: 1678480000000,
      },
      {
        id: '39',
        name: '旅行记录.mp4',
        type: 'file',
        parentId: '1',
        path: '/media/旅行记录.mp4',
        size: 786432000, // 约750MB
        lastModified: 1678460000000,
      },
    ],
  },
  {
    id: '11',
    name: '下载',
    type: 'folder',
    parentId: null,
    path: '/下载',
    children: [
      {
        id: '12',
        name: '教学视频.mp4',
        type: 'file',
        parentId: '11',
        path: '/media/教学视频.mp4',
        size: 314572800, // 约300MB
        lastModified: 1678400000000,
      },
      {
        id: '40',
        name: '会议录像.mp4',
        type: 'file',
        parentId: '11',
        path: '/media/会议录像.mp4',
        size: 1073741824, // 约1GB
        lastModified: 1678420000000,
      },
      {
        id: '41',
        name: '演示文稿视频.mp4',
        type: 'file',
        parentId: '11',
        path: '/media/演示文稿视频.mp4',
        size: 419430400, // 约400MB
        lastModified: 1678440000000,
      },
      {
        id: '42',
        name: '游戏实况.mp4',
        type: 'file',
        parentId: '11',
        path: '/media/游戏实况.mp4',
        size: 1610612736, // 约1.5GB
        lastModified: 1678460000000,
      },
      {
        id: '43',
        name: '音乐视频.mp4',
        type: 'file',
        parentId: '11',
        path: '/media/音乐视频.mp4',
        size: 536870912, // 约500MB
        lastModified: 1678480000000,
      },
    ],
  },
  {
    id: '44',
    name: '收藏夹',
    type: 'folder',
    parentId: null,
    path: '/收藏夹',
    children: [
      {
        id: '45',
        name: '经典电影',
        type: 'folder',
        parentId: '44',
        path: '/收藏夹/经典电影',
        children: [
          {
            id: '46',
            name: '教父.mp4',
            type: 'file',
            parentId: '45',
            path: '/media/教父.mp4',
            size: 1468006400, // 约1.37GB
            lastModified: 1678400000000,
          },
          {
            id: '47',
            name: '泰坦尼克号.mp4',
            type: 'file',
            parentId: '45',
            path: '/media/泰坦尼克号.mp4',
            size: 1932735283, // 约1.8GB
            lastModified: 1678380000000,
          },
          {
            id: '48',
            name: '辛德勒的名单.mp4',
            type: 'file',
            parentId: '45',
            path: '/media/辛德勒的名单.mp4',
            size: 1610612736, // 约1.5GB
            lastModified: 1678360000000,
          },
        ],
      },
      {
        id: '49',
        name: '教程视频',
        type: 'folder',
        parentId: '44',
        path: '/收藏夹/教程视频',
        children: [
          {
            id: '50',
            name: '摄影入门.mp4',
            type: 'file',
            parentId: '49',
            path: '/media/摄影入门.mp4',
            size: 838860800, // 约800MB
            lastModified: 1678340000000,
          },
          {
            id: '51',
            name: '剪辑教程.mp4',
            type: 'file',
            parentId: '49',
            path: '/media/剪辑教程.mp4',
            size: 734003200, // 约700MB
            lastModified: 1678320000000,
          },
        ],
      },
    ],
  },
  {
    id: '52',
    name: '工作视频',
    type: 'folder',
    parentId: null,
    path: '/工作视频',
    children: [
      {
        id: '53',
        name: '项目演示.mp4',
        type: 'file',
        parentId: '52',
        path: '/media/项目演示.mp4',
        size: 1073741824, // 约1GB
        lastModified: 1678300000000,
      },
      {
        id: '54',
        name: '产品介绍.mp4',
        type: 'file',
        parentId: '52',
        path: '/media/产品介绍.mp4',
        size: 858993459, // 约819MB
        lastModified: 1678280000000,
      },
      {
        id: '55',
        name: '客户访谈.mp4',
        type: 'file',
        parentId: '52',
        path: '/media/客户访谈.mp4',
        size: 644245094, // 约615MB
        lastModified: 1678260000000,
      },
      {
        id: '56',
        name: '团队会议.mp4',
        type: 'file',
        parentId: '52',
        path: '/media/团队会议.mp4',
        size: 905969664, // 约864MB
        lastModified: 1678240000000,
      },
    ],
  },
];